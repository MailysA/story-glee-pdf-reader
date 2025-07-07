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
  direction?: 'left' | 'right' | 'none';
  className?: string;
  children?: React.ReactNode;
}

export const SandmanAnimation = ({ isActive = false, direction = 'none', className, children }: SandmanAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<SandParticle[]>([]);
  const sweepProgressRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const mask = maskRef.current;
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

    // Initialize sweep progress
    if (isActive && direction !== 'none') {
      sweepProgressRef.current = 0;
    }

    // Create sweeping dust burst
    const createSweepingDust = () => {
      if (direction === 'none' || !isActive) return;
      
      const particleCount = 150;
      const sweepWidth = canvas.width * 0.3;
      const sweepPosition = direction === 'right' 
        ? sweepProgressRef.current * canvas.width
        : canvas.width - (sweepProgressRef.current * canvas.width);
      
      for (let i = 0; i < particleCount; i++) {
        const directionMultiplier = direction === 'right' ? 1 : -1;
        const spreadX = (Math.random() - 0.5) * sweepWidth;
        
        particlesRef.current.push({
          x: sweepPosition + spreadX,
          y: Math.random() * canvas.height,
          vx: (Math.random() * 6 + 3) * directionMultiplier + (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 4,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          life: 0,
          maxLife: Math.random() * 80 + 40
        });
      }
    };

    // Create star dust particles
    const createStarDust = () => {
      if (!isActive) return;
      
      const starCount = 30;
      const sweepPosition = direction === 'right' 
        ? sweepProgressRef.current * canvas.width
        : canvas.width - (sweepProgressRef.current * canvas.width);
      
      for (let i = 0; i < starCount; i++) {
        particlesRef.current.push({
          x: sweepPosition + (Math.random() - 0.5) * 200,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: Math.random() * 3 + 1,
          opacity: 1,
          life: 0,
          maxLife: Math.random() * 120 + 80
        });
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update sweep progress
      if (isActive && direction !== 'none') {
        sweepProgressRef.current = Math.min(1, sweepProgressRef.current + 0.008);
        
        // Update mask for text reveal
        if (mask) {
          const revealWidth = sweepProgressRef.current * 100;
          if (direction === 'right') {
            mask.style.clipPath = `inset(0 ${100 - revealWidth}% 0 0)`;
          } else {
            mask.style.clipPath = `inset(0 0 0 ${100 - revealWidth}%)`;
          }
        }
        
        // Create sweeping particles
        if (sweepProgressRef.current < 0.9) {
          createSweepingDust();
          if (Math.random() < 0.3) {
            createStarDust();
          }
        }
      }
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Apply gravity and air resistance
        particle.vy += 0.08;
        particle.vx *= 0.998;
        particle.vy *= 0.998;
        
        // Update life
        particle.life++;
        particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife));
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.7;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y > canvas.height) {
          particle.vy *= -0.5;
          particle.y = canvas.height;
        }
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        
        // Create star-like particles
        if (particle.size > 2) {
          // Draw star shape
          ctx.fillStyle = `hsl(${45 + Math.sin(particle.life * 0.1) * 10}, 90%, 80%)`;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = particle.x + Math.cos(angle) * particle.size;
            const y = particle.y + Math.sin(angle) * particle.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          
          // Add glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'hsl(50, 100%, 60%)';
          ctx.fill();
        } else {
          // Regular sand particles
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
          );
          gradient.addColorStop(0, 'hsl(45, 80%, 75%)');
          gradient.addColorStop(0.5, 'hsl(40, 70%, 65%)');
          gradient.addColorStop(1, 'hsl(35, 60%, 45%)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
        
        return particle.life < particle.maxLife;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Handle canvas clicks to create sand bursts
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create burst effect
      const burstCount = 25;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount;
        const speed = Math.random() * 5 + 3;
        particlesRef.current.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.5 + 0.5,
          opacity: 1,
          life: 0,
          maxLife: Math.random() * 70 + 40
        });
      }
    };

    canvas.addEventListener('click', handleClick);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, direction]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Content that gets revealed */}
      {children && (
        <div 
          ref={maskRef}
          className="relative z-10 h-full w-full"
          style={{
            clipPath: isActive && direction !== 'none' ? 'inset(0 100% 0 0)' : 'none',
            transition: 'none'
          }}
        >
          {children}
        </div>
      )}
      
      {/* Canvas for sand animation */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 w-full h-full z-20",
          isActive ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
        )}
        style={{ 
          mixBlendMode: 'multiply',
          background: 'transparent'
        }}
      />
      
      {/* Mystical overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-amber-800/10 pointer-events-none z-5" />
      
      {isActive && (
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-medium opacity-70 z-30">
          Le sable révèle l'histoire ✨
        </div>
      )}
    </div>
  );
};
