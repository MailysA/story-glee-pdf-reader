import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

// Secure logging function - no sensitive data
const logStep = (step: string, details?: any) => {
  const sanitizedDetails = details ? {
    ...details,
    email: details.email ? '[REDACTED]' : undefined,
    userId: details.userId ? '[REDACTED]' : undefined,
    customerId: details.customerId ? '[REDACTED]' : undefined,
    sessionId: details.sessionId ? '[REDACTED]' : undefined,
    url: details.url ? '[REDACTED]' : undefined,
  } : undefined;
  
  const detailsStr = sanitizedDetails ? ` - ${JSON.stringify(sanitizedDetails)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Invalid authorization header");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    if (!token || token.length < 10) {
      throw new Error("Invalid token format");
    }
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error("Authentication failed");
    const user = userData.user;
    if (!user?.email || !user.id) throw new Error("User authentication required");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Validate return URL
    const returnOrigin = origin || ALLOWED_ORIGINS[0];
    const returnUrl = `${returnOrigin}/dashboard`;
    
    // Ensure return URL is from allowed origins
    if (!ALLOWED_ORIGINS.some(allowedOrigin => returnUrl.startsWith(allowedOrigin))) {
      throw new Error("Invalid return URL");
    }
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: "Error occurred" });
    
    // Sanitized error messages
    const publicMessage = errorMessage.includes("authentication") 
      ? "Authentication required"
      : errorMessage.includes("No Stripe customer")
      ? "Customer not found"
      : errorMessage.includes("Invalid return URL")
      ? "Invalid return URL"
      : "Unable to access customer portal";
      
    const statusCode = errorMessage.includes("authentication") ? 401 : 500;
    
    return new Response(JSON.stringify({ error: publicMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});