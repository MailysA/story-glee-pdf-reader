import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SandParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface SandmanAnimationProps {
  isActive?: boolean;
  className?: string;
}

export const SandmanAnimation = ({ isActive = false, className }: SandmanAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<SandParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = 150;
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          life: 0,
          maxLife: Math.random() * 200 + 100
        });
      }
    };

    // Create sand particles effect
    const createSandBurst = (x: number, y: number) => {
      const burstCount = 20;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount;
        const speed = Math.random() * 4 + 2;
        particlesRef.current.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2 + 0.5,
          opacity: 1,
          life: 0,
          maxLife: Math.random() * 60 + 30
        });
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Apply gravity and air resistance
        particle.vy += 0.1;
        particle.vx *= 0.995;
        particle.vy *= 0.995;
        
        // Update life
        particle.life++;
        particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife));
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y > canvas.height) {
          particle.vy *= -0.6;
          particle.y = canvas.height;
        }
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Create sand-like gradient
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, 'hsl(45, 80%, 70%)');
        gradient.addColorStop(0.5, 'hsl(40, 70%, 60%)');
        gradient.addColorStop(1, 'hsl(35, 60%, 40%)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some sparkle effect
        if (Math.random() < 0.1) {
          ctx.fillStyle = 'hsl(50, 90%, 80%)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
        
        return particle.life < particle.maxLife;
      });
      
      // Add new particles occasionally when active
      if (isActive && Math.random() < 0.3) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.3;
        createSandBurst(x, y);
      }
      
      // Keep some base particles
      if (particlesRef.current.length < 50) {
        initParticles();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Handle canvas clicks to create sand bursts
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createSandBurst(x, y);
    };

    canvas.addEventListener('click', handleClick);
    
    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer"
        style={{ 
          background: 'radial-gradient(ellipse at center, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)',
          mixBlendMode: 'multiply'
        }}
      />
      
      {/* Overlay effect for more mystical appearance */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-amber-800/10 pointer-events-none" />
      
      {isActive && (
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-medium opacity-70">
          Cliquez pour créer des particules de sable ✨
        </div>
      )}
    </div>
  );
};
