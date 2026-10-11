"use client";

import React, { useEffect, useRef } from "react";

export function PitchAtmosphere3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle definition with 3D z-depth
    interface Particle3D {
      x: number;
      y: number;
      z: number; // 0 to 1000
      size: number;
      vx: number;
      vy: number;
      vz: number;
      color: string;
    }

    const colors = [
      "rgba(245, 158, 11, ", // amber
      "rgba(56, 189, 248, ", // sky
      "rgba(99, 102, 241, ", // indigo
      "rgba(16, 185, 129, ", // emerald
    ];

    const particleCount = 75;
    const particles: Particle3D[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * 800 + 100,
        size: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.05;
      mouseY = (e.clientY - height / 2) * 0.05;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const fov = 400; // Focal length

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx - mouseX * 0.02;
        p.y += p.vy - mouseY * 0.02;
        p.z += p.vz;

        // Wrap around 3D frustum
        if (p.z <= 10) p.z = 800;
        if (p.z > 800) p.z = 10;
        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;

        // 3D Perspective projection
        const scale = fov / (fov + p.z);
        const projX = p.x * scale + width / 2;
        const projY = p.y * scale + height / 2;
        const projSize = Math.max(0.5, p.size * scale);
        const opacity = Math.min(1, Math.max(0.05, (1 - p.z / 800) * 0.6));

        ctx.beginPath();
        ctx.arc(projX, projY, projSize, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${opacity})`;
        ctx.shadowColor = `${p.color}0.8)`;
        ctx.shadowBlur = 8 * scale;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      style={{ willChange: "transform" }}
    />
  );
}
