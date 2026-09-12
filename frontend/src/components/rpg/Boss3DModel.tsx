"use client";

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { CharacterAttribute, QuestDifficulty } from "@/types/quest";
import { EnemyBattleState, getEnemyArchetypeInfo } from "@/components/rpg/EnemySprite";

interface Boss3DModelProps {
  state: EnemyBattleState;
  attribute: CharacterAttribute;
  difficulty: QuestDifficulty;
  hp?: number; // 0 to 100
  className?: string;
}

export function Boss3DModel({
  state = "IDLE",
  attribute,
  difficulty,
  hp = 100,
  className = "",
}: Boss3DModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to keep animation loop synchronized with React props
  const stateRef = useRef(state);
  const hpRef = useRef(hp);
  stateRef.current = state;
  hpRef.current = hp;

  const archetype = useMemo(() => {
    return getEnemyArchetypeInfo(attribute, difficulty);
  }, [attribute, difficulty]);

  const archetypeRef = useRef(archetype);
  archetypeRef.current = archetype;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // --- 1. RENDERER & SCENE SETUP ---
    let width = container.clientWidth || 360;
    let height = container.clientHeight || 420;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    // Position camera to frame the boss from front-left perspective
    camera.position.set(0.1, 1.2, 5.2);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- 2. DYNAMIC LIGHTING RIG ---
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x1a2038, 1.4);
    scene.add(ambientLight);

    // Warm Key Light from Top-Front
    const keyLight = new THREE.DirectionalLight(0xffecd0, 2.6);
    keyLight.position.set(-2.5, 5, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // High-Voltage Rim Light from Behind (Takes Creature Element Color)
    const rimColor = new THREE.Color(archetypeRef.current.primaryColor);
    const rimLight = new THREE.DirectionalLight(rimColor, 4.5);
    rimLight.position.set(3.5, 3.5, -3.5);
    scene.add(rimLight);

    // Internal Pulsating Core Point Light (Lights up chest, jaw, claws)
    const coreLight = new THREE.PointLight(rimColor, 3.5, 4.0);
    coreLight.position.set(0, 1.05, 0.35);
    scene.add(coreLight);

    // --- 3. MATERIALS (Obsidian Carapace + Emissive Veins) ---
    const carapaceMat = new THREE.MeshStandardMaterial({
      color: 0x12141c,
      roughness: 0.32,
      metalness: 0.82,
    });

    const armorAccentMat = new THREE.MeshStandardMaterial({
      color: 0x1c1e28,
      roughness: 0.25,
      metalness: 0.9,
    });

    const veinMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      emissive: rimColor,
      emissiveIntensity: 2.4,
      roughness: 0.2,
    });

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: rimColor,
      emissiveIntensity: 3.8,
      roughness: 0.1,
      metalness: 0.1,
    });

    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    // --- 4. HIERARCHICAL 3D ALIEN RAID BOSS MESH ---
    const bossRoot = new THREE.Group();
    // Angle slightly toward the hero on the left
    bossRoot.rotation.y = -0.32;
    scene.add(bossRoot);

    // (A) Pelvis & Lower Carapace
    const pelvisGeo = new THREE.CylinderGeometry(0.3, 0.22, 0.35, 6);
    const pelvis = new THREE.Mesh(pelvisGeo, carapaceMat);
    pelvis.position.y = 0.65;
    bossRoot.add(pelvis);

    // Jagged Hip Guards
    [-0.28, 0.28].forEach((xOffset) => {
      const hipGuardGeo = new THREE.ConeGeometry(0.16, 0.45, 4);
      const hipGuard = new THREE.Mesh(hipGuardGeo, armorAccentMat);
      hipGuard.position.set(xOffset, 0.65, 0.05);
      hipGuard.rotation.z = xOffset < 0 ? 0.6 : -0.6;
      bossRoot.add(hipGuard);
    });

    // (B) Legs & Obsidian Talons (Digitigrade Alien Structure)
    const legLeftGroup = new THREE.Group();
    const legRightGroup = new THREE.Group();

    const buildAlienLeg = (group: THREE.Group, isLeft: boolean) => {
      const xSide = isLeft ? -0.22 : 0.22;
      group.position.set(xSide, 0.65, 0);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.45, 5);
      const thigh = new THREE.Mesh(thighGeo, carapaceMat);
      thigh.position.set(0, -0.2, 0.05);
      thigh.rotation.x = -0.4;
      group.add(thigh);

      // Shin (Angled forward)
      const shinGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.48, 5);
      const shin = new THREE.Mesh(shinGeo, carapaceMat);
      shin.position.set(0, -0.45, -0.05);
      shin.rotation.x = 0.5;
      group.add(shin);

      // Shin Armor Spine
      const spineGeo = new THREE.ConeGeometry(0.05, 0.3, 3);
      const spine = new THREE.Mesh(spineGeo, armorAccentMat);
      spine.position.set(0, -0.45, 0.04);
      spine.rotation.x = 0.5;
      group.add(spine);

      // Three Sharp Talons
      [-0.08, 0, 0.08].forEach((clawX) => {
        const talonGeo = new THREE.ConeGeometry(0.04, 0.22, 4);
        const talon = new THREE.Mesh(talonGeo, armorAccentMat);
        talon.position.set(clawX, -0.65, 0.08 - Math.abs(clawX) * 0.3);
        talon.rotation.x = 1.35;
        group.add(talon);
      });
    };

    buildAlienLeg(legLeftGroup, true);
    buildAlienLeg(legRightGroup, false);
    bossRoot.add(legLeftGroup);
    bossRoot.add(legRightGroup);

    // (C) Torso, Spine & Glowing Abdomen Fissures
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.75, 0);
    bossRoot.add(torsoGroup);

    // Segmented Abdomen
    const abdoGeo = new THREE.CylinderGeometry(0.32, 0.24, 0.38, 7);
    const abdo = new THREE.Mesh(abdoGeo, carapaceMat);
    abdo.position.set(0, 0.18, 0);
    torsoGroup.add(abdo);

    // Glowing energy vein bands around waist
    const veinBandGeo = new THREE.TorusGeometry(0.28, 0.025, 4, 16);
    const veinBand = new THREE.Mesh(veinBandGeo, veinMat);
    veinBand.position.set(0, 0.18, 0);
    veinBand.rotation.x = Math.PI / 2;
    torsoGroup.add(veinBand);

    // Massive Broad Upper Chest Carapace
    const chestGroup = new THREE.Group();
    chestGroup.position.set(0, 0.42, 0);
    torsoGroup.add(chestGroup);

    const chestPlateGeo = new THREE.BoxGeometry(0.85, 0.52, 0.48);
    const chestPlate = new THREE.Mesh(chestPlateGeo, carapaceMat);
    chestGroup.add(chestPlate);

    // Center Rib Carapace Flaps Guarding the Core
    [-0.22, 0.22].forEach((xPos) => {
      const ribGeo = new THREE.ConeGeometry(0.12, 0.45, 4);
      const rib = new THREE.Mesh(ribGeo, armorAccentMat);
      rib.position.set(xPos, -0.05, 0.26);
      rib.rotation.z = xPos < 0 ? -0.4 : 0.4;
      chestGroup.add(rib);
    });

    // (D) THE GLOWING POWER CORE (Digital Twin Task Energy Heart)
    const coreMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 1), coreMat);
    coreMesh.position.set(0, 0.02, 0.22);
    chestGroup.add(coreMesh);

    // Orbiting Arcane Sigil Ring around Core
    const coreRingGeo = new THREE.TorusGeometry(0.22, 0.015, 6, 24);
    const coreRing = new THREE.Mesh(coreRingGeo, veinMat);
    coreRing.position.set(0, 0.02, 0.22);
    chestGroup.add(coreRing);

    // (E) Massive Jagged Spiked Shoulders & Arms
    const shoulderLeft = new THREE.Group();
    const shoulderRight = new THREE.Group();
    shoulderLeft.position.set(-0.52, 0.22, 0);
    shoulderRight.position.set(0.52, 0.22, 0);
    chestGroup.add(shoulderLeft);
    chestGroup.add(shoulderRight);

    // Massive Pauldrons with Horn Spikes
    [-1, 1].forEach((dir) => {
      const pauldronTarget = dir === -1 ? shoulderLeft : shoulderRight;
      const pauldronGeo = new THREE.ConeGeometry(0.28, 0.55, 5);
      const pauldron = new THREE.Mesh(pauldronGeo, armorAccentMat);
      pauldron.position.set(0, 0.12, 0);
      pauldron.rotation.z = dir * -0.7;
      pauldronTarget.add(pauldron);

      // Second Jagged Pauldron Spike
      const spike2Geo = new THREE.ConeGeometry(0.12, 0.42, 4);
      const spike2 = new THREE.Mesh(spike2Geo, armorAccentMat);
      spike2.position.set(dir * 0.15, 0.28, -0.08);
      spike2.rotation.z = dir * -1.1;
      pauldronTarget.add(spike2);
    });

    // Arm Chains
    const leftArmGroup = new THREE.Group();
    const rightArmGroup = new THREE.Group();
    shoulderLeft.add(leftArmGroup);
    shoulderRight.add(rightArmGroup);

    const buildArm = (armGroup: THREE.Group, isLeft: boolean) => {
      // Bicep
      const bicepGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.45, 5);
      const bicep = new THREE.Mesh(bicepGeo, carapaceMat);
      bicep.position.set(0, -0.22, 0);
      armGroup.add(bicep);

      // Elbow Forearm
      const forearmGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.48, 5);
      const forearm = new THREE.Mesh(forearmGeo, carapaceMat);
      forearm.position.set(isLeft ? 0.05 : -0.05, -0.58, 0.12);
      forearm.rotation.x = -0.55;
      armGroup.add(forearm);

      // Chitin Arm Blade on Forearm
      const armBladeGeo = new THREE.ConeGeometry(0.08, 0.5, 3);
      const armBlade = new THREE.Mesh(armBladeGeo, armorAccentMat);
      armBlade.position.set(isLeft ? -0.08 : 0.08, -0.58, 0.05);
      armBlade.rotation.x = 2.2;
      armGroup.add(armBlade);

      // Elongated Alien Claws (4 Sharp Talons on Hand)
      [-0.06, -0.02, 0.03, 0.07].forEach((clawOffset) => {
        const clawGeo = new THREE.ConeGeometry(0.035, 0.28, 4);
        const claw = new THREE.Mesh(clawGeo, armorAccentMat);
        claw.position.set(
          (isLeft ? 0.05 : -0.05) + clawOffset,
          -0.82,
          0.26
        );
        claw.rotation.x = -1.1;
        armGroup.add(claw);
      });
    };

    buildArm(leftArmGroup, true);
    buildArm(rightArmGroup, false);

    // (F) Low-Slung Predatory Head, Jaw & Multiple Glowing Eyes
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.32, 0.28);
    chestGroup.add(headGroup);

    // Alien Cranium (Hunched forward)
    const craniumGeo = new THREE.ConeGeometry(0.24, 0.65, 6);
    const cranium = new THREE.Mesh(craniumGeo, carapaceMat);
    cranium.rotation.x = -1.35;
    headGroup.add(cranium);

    // Back Swept Horn Spikes
    [-0.14, 0.14].forEach((hornX) => {
      const hornGeo = new THREE.ConeGeometry(0.08, 0.55, 4);
      const horn = new THREE.Mesh(hornGeo, armorAccentMat);
      horn.position.set(hornX, 0.18, -0.15);
      horn.rotation.x = -0.8;
      horn.rotation.z = hornX < 0 ? -0.35 : 0.35;
      headGroup.add(horn);
    });

    // Articulated Lower Jaw / Mandibles
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.08, 0.18);
    headGroup.add(jawGroup);

    const jawGeo = new THREE.ConeGeometry(0.14, 0.32, 4);
    const jaw = new THREE.Mesh(jawGeo, armorAccentMat);
    jaw.rotation.x = 1.35;
    jawGroup.add(jaw);

    // Split Outer Mandibles
    [-0.12, 0.12].forEach((mX) => {
      const mandibleGeo = new THREE.ConeGeometry(0.05, 0.26, 3);
      const mandible = new THREE.Mesh(mandibleGeo, armorAccentMat);
      mandible.position.set(mX, 0, 0.05);
      mandible.rotation.z = mX < 0 ? -0.5 : 0.5;
      mandible.rotation.x = 0.6;
      jawGroup.add(mandible);
    });

    // Multiple Glowing Eyes (2 Main Forward Eyes + 4 Lateral Sensory Pits)
    const eyePositions = [
      [-0.07, 0.04, 0.26],
      [0.07, 0.04, 0.26],
      [-0.12, 0.08, 0.22],
      [0.12, 0.08, 0.22],
      [-0.09, -0.01, 0.24],
      [0.09, -0.01, 0.24],
    ];

    eyePositions.forEach(([ex, ey, ez]) => {
      const eyeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), eyeMat);
      eyeMesh.position.set(ex, ey, ez);
      headGroup.add(eyeMesh);
    });

    // (G) 4 Biomechanical Arched Back Spines / Tendrils
    const tendrilMeshes: THREE.Mesh[] = [];
    [-0.24, -0.08, 0.08, 0.24].forEach((tX, tIdx) => {
      const tendrilGeo = new THREE.CylinderGeometry(0.03, 0.01, 0.75, 5);
      const tendril = new THREE.Mesh(tendrilGeo, armorAccentMat);
      tendril.position.set(tX, 0.35, -0.22);
      tendril.rotation.x = -0.65;
      tendril.rotation.z = (tIdx - 1.5) * 0.25;
      chestGroup.add(tendril);
      tendrilMeshes.push(tendril);
    });

    // (H) Ground Contact Shadow Plane
    const shadowGeo = new THREE.CircleGeometry(0.95, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.65,
    });
    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = 0.02;
    scene.add(groundShadow);

    // (I) Floating Energy Sparks / Motes around the Boss
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 1.6;
      particlePositions[i * 3 + 1] = 0.2 + Math.random() * 1.8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
      particleSpeeds[i] = 0.4 + Math.random() * 0.8;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: rimColor,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- 5. ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentHp = hpRef.current;
      const currentState = stateRef.current;

      // Update archetype colors if changed dynamically
      const curColor = new THREE.Color(archetypeRef.current.primaryColor);
      rimLight.color.lerp(curColor, 0.1);
      coreLight.color.lerp(curColor, 0.1);
      veinMat.emissive.lerp(curColor, 0.1);
      coreMat.emissive.lerp(curColor, 0.1);
      particleMat.color.lerp(curColor, 0.1);

      // Core rotation
      coreMesh.rotation.y = elapsedTime * 1.4;
      coreMesh.rotation.x = elapsedTime * 0.8;
      coreRing.rotation.z = -elapsedTime * 2.0;

      // Tendril undulation
      tendrilMeshes.forEach((tendril, idx) => {
        tendril.rotation.x = -0.65 + Math.sin(elapsedTime * 2.5 + idx) * 0.12;
      });

      // Particle floating
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleSpeeds[i] * 0.008;
        if (positions[i * 3 + 1] > 2.2) {
          positions[i * 3 + 1] = 0.2;
          positions[i * 3 + 0] = (Math.random() - 0.5) * 1.6;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // HP-Based Core Pulse Frequency & Emissive Intensity
      // Current HP Ratio drives breathing and core intensity
      const breathSpeed = currentHp <= 25 ? 5.2 : currentHp <= 50 ? 3.4 : 2.0;
      const breathCycle = Math.sin(elapsedTime * breathSpeed);

      // Core light intensity: pulsates, flickers if low HP
      const baseIntensity = currentHp <= 25 ? 4.5 + Math.sin(elapsedTime * 15) * 2.0 : 3.0;
      coreLight.intensity = baseIntensity + breathCycle * 1.2;
      coreMat.emissiveIntensity = 2.8 + breathCycle * 1.5;

      // Ground shadow expands/contracts with breathing
      groundShadow.scale.set(
        1.0 + breathCycle * 0.08,
        1.0 + breathCycle * 0.08,
        1.0
      );

      // --- STATE-MACHINE ANIMATION ---
      if (currentState === "DEFEATED" || currentHp <= 0) {
        // Stagger, kneel, collapse to floor, dissolve
        bossRoot.position.y = THREE.MathUtils.lerp(bossRoot.position.y, -0.35, 0.04);
        bossRoot.rotation.x = THREE.MathUtils.lerp(bossRoot.rotation.x, 0.7, 0.05);
        bossRoot.rotation.z = THREE.MathUtils.lerp(bossRoot.rotation.z, -0.3, 0.05);
        chestGroup.position.y = THREE.MathUtils.lerp(chestGroup.position.y, 0.15, 0.04);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.8, 0.06);
        coreLight.intensity = THREE.MathUtils.lerp(coreLight.intensity, 0.2, 0.05);
        jawGroup.rotation.x = THREE.MathUtils.lerp(jawGroup.rotation.x, 0.8, 0.06);
      } else if (currentState === "HIT") {
        // Stagger recoil back
        bossRoot.position.z = THREE.MathUtils.lerp(bossRoot.position.z, -0.45, 0.25);
        bossRoot.position.x = THREE.MathUtils.lerp(bossRoot.position.x, 0.35, 0.25);
        bossRoot.rotation.x = THREE.MathUtils.lerp(bossRoot.rotation.x, -0.25, 0.25);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -0.4, 0.3);
        jawGroup.rotation.x = THREE.MathUtils.lerp(jawGroup.rotation.x, 0.5, 0.3);
        shoulderLeft.rotation.z = THREE.MathUtils.lerp(shoulderLeft.rotation.z, 0.3, 0.25);
        shoulderRight.rotation.z = THREE.MathUtils.lerp(shoulderRight.rotation.z, -0.3, 0.25);
      } else if (currentState === "ATTACK") {
        // Deep lunge forward toward the player (negative X direction)
        const attackCycle = (elapsedTime * 3.5) % Math.PI;
        const lungeDist = Math.sin(attackCycle) * 1.25;
        bossRoot.position.x = -lungeDist;
        bossRoot.position.z = Math.sin(attackCycle) * 0.4;
        bossRoot.rotation.x = 0.25;
        // Strike arms forward
        leftArmGroup.rotation.x = -1.4 + Math.sin(attackCycle) * 0.8;
        rightArmGroup.rotation.x = -1.4 + Math.sin(attackCycle) * 0.8;
        // Jaw open roaring
        jawGroup.rotation.x = 0.65;
        headGroup.rotation.y = Math.sin(elapsedTime * 8) * 0.15;
      } else if (currentState === "APPROACH") {
        // Stalking stride
        const stride = Math.sin(elapsedTime * 4.5);
        bossRoot.position.x = THREE.MathUtils.lerp(bossRoot.position.x, -0.4, 0.08);
        bossRoot.rotation.x = 0.18;
        torsoGroup.rotation.z = stride * 0.08;
        legLeftGroup.rotation.x = stride * 0.35;
        legRightGroup.rotation.x = -stride * 0.35;
      } else {
        // IDLE: Organic breathing, predatory posture
        bossRoot.position.x = THREE.MathUtils.lerp(bossRoot.position.x, 0, 0.08);
        bossRoot.position.y = THREE.MathUtils.lerp(bossRoot.position.y, 0, 0.08);
        bossRoot.position.z = THREE.MathUtils.lerp(bossRoot.position.z, 0, 0.08);
        bossRoot.rotation.x = currentHp <= 25 ? 0.22 : 0.05; // Hunches forward when low HP

        // Chest heave
        chestGroup.position.y = 0.42 + breathCycle * 0.04;
        torsoGroup.position.y = 0.75 + breathCycle * 0.02;

        // Shoulder rise
        shoulderLeft.rotation.z = breathCycle * 0.06;
        shoulderRight.rotation.z = -breathCycle * 0.06;

        // Occasional predatory head glance
        const glance = Math.sin(elapsedTime * 0.8) > 0.85 ? Math.sin(elapsedTime * 6) * 0.18 : 0;
        headGroup.rotation.y = glance;
        headGroup.rotation.x = -0.05 + breathCycle * 0.03;

        // Arm idle sway
        leftArmGroup.rotation.x = -0.1 + breathCycle * 0.08;
        rightArmGroup.rotation.x = -0.1 + breathCycle * 0.08;

        // Jaw snaps slightly during low HP
        jawGroup.rotation.x = currentHp <= 25 ? 0.18 + Math.sin(elapsedTime * 6) * 0.08 : 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 360;
      height = container.clientHeight || 420;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      pelvisGeo.dispose();
      abdoGeo.dispose();
      chestPlateGeo.dispose();
      shadowGeo.dispose();
      particleGeo.dispose();
      carapaceMat.dispose();
      armorAccentMat.dispose();
      veinMat.dispose();
      coreMat.dispose();
      eyeMat.dispose();
      shadowMat.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-64 h-72 sm:w-80 sm:h-96 lg:w-96 lg:h-[430px] flex items-center justify-center select-none pointer-events-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
