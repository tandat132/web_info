'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface ParticlesBackgroundProps {
  particleCount?: number;
  colors?: string[];
  speed?: number;
}

export default function ParticlesBackground({ 
  particleCount = 50, 
  colors = ['rgba(255, 255, 255, 0.1)', 'rgba(255, 182, 193, 0.1)', 'rgba(147, 51, 234, 0.1)'],
  speed = 0.5 
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Responsive particle count based on screen size
    const getResponsiveParticleCount = () => {
      const width = window.innerWidth;
      if (width < 480) return Math.floor(particleCount * 0.3); // 30% on very small screens
      if (width < 768) return Math.floor(particleCount * 0.5); // 50% on mobile
      if (width < 1024) return Math.floor(particleCount * 0.7); // 70% on tablet
      return particleCount; // Full count on desktop
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveParticleCount = prefersReducedMotion ? Math.floor(particleCount * 0.2) : getResponsiveParticleCount();

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < effectiveParticleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    initParticles();

    // Update particles function
    const updateParticles = (canvasWidth: number, canvasHeight: number) => {
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvasWidth) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > canvasHeight) {
          particle.vy *= -1;
        }

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
        particle.y = Math.max(0, Math.min(canvasHeight, particle.y));
      });
    };

    // Draw particles function
    const drawParticles = (context: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      particlesRef.current.forEach((particle, index) => {
        // Draw particle
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particle.color;
        context.globalAlpha = particle.opacity;
        context.fill();

        // Draw connections to nearby particles
        particlesRef.current.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              context.beginPath();
              context.moveTo(particle.x, particle.y);
              context.lineTo(otherParticle.x, otherParticle.y);
              context.strokeStyle = particle.color;
              context.globalAlpha = (100 - distance) / 100 * 0.2;
              context.lineWidth = 0.5;
              context.stroke();
            }
          }
        });
      });
    };

    // Performance optimization: throttle animation on mobile
    let lastTime = 0;
    const targetFPS = window.innerWidth < 768 ? 30 : 60; // Lower FPS on mobile
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        updateParticles(canvas.width, canvas.height);
        drawParticles(ctx, canvas.width, canvas.height);
        lastTime = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation only if not in reduced motion mode
    if (!prefersReducedMotion) {
      animate(0);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear particles array for memory cleanup
      particlesRef.current = [];
    };
  }, [particleCount, colors, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}