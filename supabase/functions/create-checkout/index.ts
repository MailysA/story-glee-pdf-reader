import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://eczbwgkebhckysgfrqfdg.supabase.co",
  "http://localhost:5173",
  "http://localhost:3000"
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true"
  };
};

// Rate limiting function
const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (userLimit.count >= 5) { // Max 5 requests per minute
    return false;
  }
  
  userLimit.count++;
  return true;
};

// Validate redirect URL
const isValidRedirectUrl = (url: string, allowedOrigin: string): boolean => {
  try {
    const urlObj = new URL(url);
    const originObj = new URL(allowedOrigin);
    return urlObj.origin === originObj.origin;
  } catch {
    return false;
  }
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client using the anon key
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Enhanced token validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Invalid authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    if (!token || token.length < 10) {
      throw new Error("Invalid token format");
    }
    
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) throw new Error("Authentication failed");
    
    const user = data.user;
    if (!user?.email || !user.id) {
      throw new Error("User authentication required");
    }

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Validate and construct redirect URLs
    const baseOrigin = origin || ALLOWED_ORIGINS[0];
    const successUrl = `${baseOrigin}/dashboard?success=true`;
    const cancelUrl = `${baseOrigin}/dashboard?cancelled=true`;
    
    if (!isValidRedirectUrl(successUrl, baseOrigin) || !isValidRedirectUrl(cancelUrl, baseOrigin)) {
      throw new Error("Invalid redirect URLs");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: "MagicTales Premium",
              description: "Accès premium à toutes les fonctionnalités"
            },
            unit_amount: 899, // 8,99€ en centimes
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: false,
      billing_address_collection: "required",
      customer_update: customerId ? {
        address: "auto",
        name: "auto"
      } : undefined,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error instanceof Error ? error.message : String(error));
    
    // Sanitized error messages
    const publicMessage = error instanceof Error && error.message.includes("Too many requests") 
      ? "Too many requests" 
      : error instanceof Error && error.message.includes("authentication")
      ? "Authentication required"
      : "Unable to create checkout session";
    
    const statusCode = error instanceof Error && error.message.includes("Too many requests") 
      ? 429 
      : error instanceof Error && error.message.includes("authentication")
      ? 401
      : 500;
    
    return new Response(JSON.stringify({ error: publicMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});