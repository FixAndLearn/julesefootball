"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ShieldCheck, Sparkles, Trophy, Zap, RefreshCw } from "lucide-react";

export function HeroBall3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState<"normal" | "turbo">("normal");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Scene Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Groups
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Core Soccer Ball Sphere (Dark reflective base)
    const ballRadius = 2.1;
    const sphereGeo = new THREE.SphereGeometry(ballRadius, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x081024,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x030a1c,
      emissiveIntensity: 0.3,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    mainGroup.add(sphereMesh);

    // 2. Soccer Ball Wireframe Pentagons / Hexagons Lattice (Icosahedron wireframe)
    const icoGeo = new THREE.IcosahedronGeometry(ballRadius + 0.02, 2);
    const icoWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const icoWireMesh = new THREE.Mesh(icoGeo, icoWireMat);
    mainGroup.add(icoWireMesh);

    // 3. Golden Seam Accents (Outer icosahedron wireframe slightly scaled)
    const goldGeo = new THREE.IcosahedronGeometry(ballRadius + 0.04, 1);
    const goldWireMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const goldWireMesh = new THREE.Mesh(goldGeo, goldWireMat);
    mainGroup.add(goldWireMesh);

    // 4. Concentric Orbit Gyroscope Rings
    const ring1Geo = new THREE.TorusGeometry(ballRadius * 1.45, 0.025, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    ring1Mesh.rotation.y = Math.PI / 6;
    mainGroup.add(ring1Mesh);

    const ring2Geo = new THREE.TorusGeometry(ballRadius * 1.6, 0.02, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.7,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 4;
    ring2Mesh.rotation.z = Math.PI / 4;
    mainGroup.add(ring2Mesh);

    // 5. Floating Tactical Data Crystals / Gems orbiting along rings
    const crystalGeo = new THREE.OctahedronGeometry(0.12);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.9,
      metalness: 0.9,
      roughness: 0.1,
    });

    const crystals: THREE.Mesh[] = [];
    const crystalCount = 6;
    for (let i = 0; i < crystalCount; i++) {
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      mainGroup.add(crystal);
      crystals.push(crystal);
    }

    // 6. Deep Space Particle Cloud (Cyber pitch dust)
    const particleCount = 240;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorSky = new THREE.Color(0x38bdf8);
    const colorGold = new THREE.Color(0xf59e0b);
    const colorIndigo = new THREE.Color(0x818cf8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.8 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? colorGold : i % 3 === 1 ? colorSky : colorIndigo;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 2.2);
    dirLight2.position.set(-5, -4, -3);
    scene.add(dirLight2);

    const mouseLight = new THREE.PointLight(0xa855f7, 3.5, 10);
    mouseLight.position.set(0, 0, 4);
    scene.add(mouseLight);

    // Mouse Tracking & Drag Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = 0.3;
    let velocityX = 0;
    let velocityY = 0.005;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      mouseLight.position.x = normX * 3.5;
      mouseLight.position.y = normY * 3.5;

      if (isDragging) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;

        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;

        velocityX = deltaY * 0.003;
        velocityY = deltaX * 0.003;

        prevMouseX = clientX;
        prevMouseY = clientY;
      } else {
        // Subtle tilt parallax on hover
        targetRotationY += normX * 0.0008;
        targetRotationX += -normY * 0.0008;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    canvas.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container || !canvas) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Autonomous rotation & inertia decay
      if (!isDragging) {
        const baseSpeed = spinSpeed === "turbo" ? 0.022 : 0.004;
        targetRotationY += baseSpeed;
        targetRotationX += Math.sin(elapsedTime * 0.5) * 0.0008;

        // Apply decaying velocity
        targetRotationX += velocityX;
        targetRotationY += velocityY;
        velocityX *= 0.94;
        velocityY *= 0.94;
      }

      // Smooth interpolation (damping)
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.08;
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.08;

      // Independent animations for rings
      ring1Mesh.rotation.z += 0.006;
      ring2Mesh.rotation.y -= 0.008;

      // Orbiting crystals
      crystals.forEach((crystal, index) => {
        const angle = elapsedTime * 0.8 + (index * Math.PI * 2) / crystalCount;
        const crystalRadius = ballRadius * 1.5;
        crystal.position.x = Math.cos(angle) * crystalRadius;
        crystal.position.y = Math.sin(angle * 1.5) * (ballRadius * 0.8);
        crystal.position.z = Math.sin(angle) * crystalRadius;
        crystal.rotation.x += 0.02;
        crystal.rotation.y += 0.03;
      });

      // Subtle particle rotation
      particleSystem.rotation.y = elapsedTime * 0.025;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;

      // Ball subtle breathing
      const breathScale = 1 + Math.sin(elapsedTime * 2) * 0.012;
      sphereMesh.scale.set(breathScale, breathScale, breathScale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);

      // Clean up geometries and materials
      sphereGeo.dispose();
      sphereMat.dispose();
      icoGeo.dispose();
      icoWireMat.dispose();
      goldGeo.dispose();
      goldWireMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [spinSpeed]);

  const handleTurboSpin = () => {
    setSpinSpeed((prev) => (prev === "turbo" ? "normal" : "turbo"));
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
    >
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating 3D Depth Badges (CSS 3D Parallax Badges) */}
      <div className="absolute top-6 left-2 sm:left-6 animate-float-3d pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/40 shadow-xl shadow-amber-500/10 text-xs font-bold text-amber-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Epic Boosters 104+</span>
        </div>
      </div>

      <div className="absolute bottom-10 left-4 sm:left-12 animate-float-gentle pointer-events-none" style={{ animationDelay: "1.5s" }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-emerald-500/40 shadow-xl shadow-emerald-500/10 text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Non-Custodial Escrow</span>
        </div>
      </div>

      <div className="absolute top-12 right-2 sm:right-6 animate-float-3d pointer-events-none" style={{ animationDelay: "2.5s" }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-brand-500/40 shadow-xl shadow-brand-500/10 text-xs font-bold text-brand-300">
          <Zap className="w-4 h-4 text-brand-400 fill-brand-400" />
          <span>Instant M-Pesa STK</span>
        </div>
      </div>

      <div className="absolute bottom-8 right-4 sm:right-12 animate-float-gentle pointer-events-none" style={{ animationDelay: "3.5s" }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-sky-500/40 shadow-xl shadow-sky-500/10 text-xs font-bold text-sky-300">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>AES-256 Credentials</span>
        </div>
      </div>

      {/* Interactive 3D Control Pill */}
      <div className="absolute bottom-2 inset-x-0 flex justify-center items-center gap-2 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={handleTurboSpin}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border transition-all ${
            spinSpeed === "turbo"
              ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 scale-105"
              : "bg-slate-900/70 text-slate-300 border-pitch-border hover:border-slate-500 hover:text-white"
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${spinSpeed === "turbo" ? "animate-spin" : ""}`} />
          <span>{spinSpeed === "turbo" ? "Turbo Spin (Active)" : "3D Turbo Spin"}</span>
        </button>

        <span className="text-[10px] text-slate-400 bg-pitch-card/80 px-2 py-1 rounded-full border border-pitch-border/60 hidden sm:inline-block">
          👆 Drag to rotate 3D ball
        </span>
      </div>
    </div>
  );
}
