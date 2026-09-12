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

/**
 * Procedurally generates a high-detail chitin/alien skin bump map
 */
function createChitinBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 512, 512);

  // Generate organic armor ridges & scales
  ctx.strokeStyle = "#b0b0b0";
  ctx.lineWidth = 3;
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 15 + Math.random() * 45;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Chitinous fissures
  ctx.strokeStyle = "#303030";
  ctx.lineWidth = 2;
  for (let j = 0; j < 40; j++) {
    let px = Math.random() * 512;
    let py = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 5; s++) {
      px += (Math.random() - 0.5) * 60;
      py += (Math.random() - 0.5) * 60;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
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

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 420;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0.15, 1.25, 5.0);
    camera.lookAt(0, 1.02, 0);

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

    // --- 1. CINEMATIC MULTI-TIER LIGHTING ---
    // Ambient tone for rich shadow fills
    const ambientLight = new THREE.AmbientLight(0x1e2238, 2.0);
    scene.add(ambientLight);

    // Warm Sun/Colosseum Key Light
    const keyLight = new THREE.DirectionalLight(0xfff1db, 3.2);
    keyLight.position.set(-3.0, 5.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Dramatic Rim Light from behind
    const rimColor = new THREE.Color(archetypeRef.current.primaryColor);
    const rimLight = new THREE.DirectionalLight(rimColor, 5.0);
    rimLight.position.set(3.5, 4.0, -3.5);
    scene.add(rimLight);

    // DEDICATED ANGRY FACE SPOTLIGHT: ensures face, eyes, fangs are NEVER dark black!
    const faceSpotLight = new THREE.SpotLight(0xfffaed, 4.2, 7.0, Math.PI / 4, 0.4, 1.0);
    faceSpotLight.position.set(0.3, 2.2, 2.8);
    scene.add(faceSpotLight);

    // Glowing Core & Jaw Under-Light
    const coreLight = new THREE.PointLight(rimColor, 4.0, 4.5);
    coreLight.position.set(0, 1.05, 0.4);
    scene.add(coreLight);

    // Snarl Throat Glow Light (radiates from between the teeth)
    const throatLight = new THREE.PointLight(rimColor, 2.5, 2.0);
    throatLight.position.set(0, 1.35, 0.55);
    scene.add(throatLight);

    // --- 2. TEXTURES & REALISTIC MATERIALS ---
    const bumpMap = createChitinBumpTexture();

    // Armored Alien Carapace (Realistic deep metallic slate with organic specular sheen)
    const carapaceMat = new THREE.MeshStandardMaterial({
      color: 0x1f2330,
      roughness: 0.35,
      metalness: 0.72,
      bumpMap: bumpMap,
      bumpScale: 0.04,
    });

    // Angry Brow & Horn Material (Glossy, menacing weathered obsidian bone)
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0x2b3042,
      roughness: 0.28,
      metalness: 0.85,
      bumpMap: bumpMap,
      bumpScale: 0.06,
    });

    // Razor-Sharp Teeth / Fangs Material (Ivory Bone with realistic wet specular glint)
    const fangMat = new THREE.MeshStandardMaterial({
      color: 0xf5eedc,
      roughness: 0.18,
      metalness: 0.1,
    });

    // Emissive Veins & Eyes
    const veinMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      emissive: rimColor,
      emissiveIntensity: 2.8,
      roughness: 0.15,
    });

    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    // Glowing Inner Throat Cavity
    const throatMat = new THREE.MeshBasicMaterial({
      color: rimColor,
    });

    // --- 3. THE 3D ALIEN RAID BOSS MESH HIERARCHY ---
    const bossRoot = new THREE.Group();
    bossRoot.rotation.y = -0.28;
    scene.add(bossRoot);

    // (A) Torso & Muscular Alien Abdomen
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.75, 0);
    bossRoot.add(torsoGroup);

    // Segmented Abdomen
    const abdoGeo = new THREE.CylinderGeometry(0.34, 0.25, 0.42, 8);
    const abdo = new THREE.Mesh(abdoGeo, carapaceMat);
    abdo.position.set(0, 0.18, 0);
    torsoGroup.add(abdo);

    // Glowing vein rings around abdomen
    const veinTorus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.022, 6, 24), veinMat);
    veinTorus.rotation.x = Math.PI / 2;
    veinTorus.position.set(0, 0.18, 0);
    torsoGroup.add(veinTorus);

    // Broad Armored Chest Carapace
    const chestGroup = new THREE.Group();
    chestGroup.position.set(0, 0.44, 0);
    torsoGroup.add(chestGroup);

    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.54, 0.52), carapaceMat);
    chestGroup.add(chestMesh);

    // Ribcage Armor Flaps guarding the Core
    [-0.24, 0.24].forEach((rx) => {
      const rib = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.48, 4), boneMat);
      rib.position.set(rx, -0.06, 0.28);
      rib.rotation.z = rx < 0 ? -0.4 : 0.4;
      chestGroup.add(rib);
    });

    // The Glowing Power Core (Pulsating Dodecahedron)
    const coreMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 1), veinMat);
    coreMesh.position.set(0, 0.02, 0.24);
    chestGroup.add(coreMesh);

    // (B) Broad Spiked Shoulders & Muscular Arms
    const shoulderLeft = new THREE.Group();
    const shoulderRight = new THREE.Group();
    shoulderLeft.position.set(-0.55, 0.24, 0);
    shoulderRight.position.set(0.55, 0.24, 0);
    chestGroup.add(shoulderLeft);
    chestGroup.add(shoulderRight);

    // Pauldrons with Jagged Horn Spikes
    [-1, 1].forEach((dir) => {
      const targetShoulder = dir === -1 ? shoulderLeft : shoulderRight;
      const pauldron = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 5), boneMat);
      pauldron.position.set(0, 0.14, 0);
      pauldron.rotation.z = dir * -0.72;
      targetShoulder.add(pauldron);

      const subSpike = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.45, 4), boneMat);
      subSpike.position.set(dir * 0.16, 0.32, -0.09);
      subSpike.rotation.z = dir * -1.15;
      targetShoulder.add(subSpike);
    });

    // Arms & Razor Claws
    const armLeft = new THREE.Group();
    const armRight = new THREE.Group();
    shoulderLeft.add(armLeft);
    shoulderRight.add(armRight);

    const buildArm = (armGroup: THREE.Group, isLeft: boolean) => {
      // Bicep
      const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.48, 6), carapaceMat);
      bicep.position.set(0, -0.24, 0);
      armGroup.add(bicep);

      // Forearm
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.5, 6), carapaceMat);
      forearm.position.set(isLeft ? 0.06 : -0.06, -0.62, 0.14);
      forearm.rotation.x = -0.58;
      armGroup.add(forearm);

      // Chitin Arm Blade
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.55, 3), boneMat);
      blade.position.set(isLeft ? -0.1 : 0.1, -0.62, 0.06);
      blade.rotation.x = 2.25;
      armGroup.add(blade);

      // Hand & 4 Curved Razor Talons
      [-0.07, -0.02, 0.03, 0.08].forEach((cx) => {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.32, 4), fangMat);
        claw.position.set((isLeft ? 0.06 : -0.06) + cx, -0.88, 0.28);
        claw.rotation.x = -1.15;
        armGroup.add(claw);
      });
    };

    buildArm(armLeft, true);
    buildArm(armRight, false);

    // =========================================================================
    // (C) THE ANGRY MENACING FACE (High Realism, Teeth, Brow, Glowing Eyes)
    // =========================================================================
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.36, 0.3);
    chestGroup.add(headGroup);

    // 1. Muscular Alien Neck with Striated Sinews
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.32, 6), carapaceMat);
    neck.position.set(0, -0.08, -0.08);
    neck.rotation.x = 0.35;
    headGroup.add(neck);

    // 2. Sculpted Alien Skull / Cranium (Low-slung predatory head)
    const cranium = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.52, 7), carapaceMat);
    cranium.position.set(0, 0.08, 0.04);
    cranium.rotation.x = -0.7;
    headGroup.add(cranium);

    // 3. Menacing Swept-Back Horn Crests
    [-0.16, 0.16].forEach((hx) => {
      const crownHorn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.65, 4), boneMat);
      crownHorn.position.set(hx, 0.26, -0.18);
      crownHorn.rotation.x = -0.85;
      crownHorn.rotation.z = hx < 0 ? -0.38 : 0.38;
      headGroup.add(crownHorn);

      // Temporal Side Horn
      const sideHorn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.42, 4), boneMat);
      sideHorn.position.set(hx * 1.6, 0.12, -0.12);
      sideHorn.rotation.x = -0.55;
      sideHorn.rotation.z = hx < 0 ? -0.85 : 0.85;
      headGroup.add(sideHorn);
    });

    // 4. HEAVILY FURROWED ANGRY V-SHAPED BROW RIDGES (Creates the unmistakable furious expression)
    const browGroup = new THREE.Group();
    browGroup.position.set(0, 0.14, 0.26);
    headGroup.add(browGroup);

    [-0.11, 0.11].forEach((bx) => {
      const browPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.14), boneMat);
      browPlate.position.set(bx, 0, 0);
      // Slanted inward and down: angry frown angle!
      browPlate.rotation.z = bx < 0 ? -0.42 : 0.42;
      browPlate.rotation.y = bx < 0 ? 0.3 : -0.3;
      browGroup.add(browPlate);
    });

    // Central Glabella Ridge (Forehead crease)
    const glabella = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 4), boneMat);
    glabella.position.set(0, 0.06, 0.02);
    glabella.rotation.x = 0.5;
    browGroup.add(glabella);

    // 5. SLANTED ANGRY GLOWING EYES (Fierce Demonic/Alien Gaze)
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(0, 0.08, 0.28);
    headGroup.add(eyeGroup);

    // Primary Furious Eyes (Slanted downward toward center)
    [-0.09, 0.09].forEach((ex) => {
      // Eyeball socket cavity
      const socket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.04), boneMat);
      socket.position.set(ex, 0, 0);
      socket.rotation.z = ex < 0 ? -0.35 : 0.35;
      eyeGroup.add(socket);

      // Glowing slit eye pupil
      const eyeSlit = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), eyeMat);
      eyeSlit.position.set(ex, 0, 0.02);
      eyeSlit.rotation.z = ex < 0 ? -0.35 : 0.35;
      eyeSlit.rotation.x = Math.PI / 2;
      eyeGroup.add(eyeSlit);
    });

    // Secondary Predatory Sensory Pits (Flanking the brow)
    [-0.15, 0.15].forEach((sx) => {
      const sensoryPit = new THREE.Mesh(new THREE.SphereGeometry(0.022, 5, 5), veinMat);
      sensoryPit.position.set(sx, 0.04, -0.02);
      eyeGroup.add(sensoryPit);
    });

    // 6. SNARLING UPPER JAW WITH INTERLOCKING FANGS
    const upperJaw = new THREE.Group();
    upperJaw.position.set(0, 0.01, 0.32);
    headGroup.add(upperJaw);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.2), boneMat);
    upperJaw.add(snout);

    // Upper Razor Fangs (Pointing downward)
    [-0.09, -0.05, -0.015, 0.015, 0.05, 0.09].forEach((fx, idx) => {
      const isSaber = idx === 0 || idx === 5;
      const toothLength = isSaber ? 0.18 : 0.11;
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.024, toothLength, 4), fangMat);
      fang.position.set(fx, -0.06 - toothLength * 0.35, 0.06);
      fang.rotation.x = Math.PI; // pointing straight down
      upperJaw.add(fang);
    });

    // 7. ARTICULATED SNARLING LOWER JAW & GLOWING MOUTH INTERIOR
    const lowerJawGroup = new THREE.Group();
    lowerJawGroup.position.set(0, -0.1, 0.24);
    headGroup.add(lowerJawGroup);

    const jawBone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 4), boneMat);
    jawBone.position.set(0, -0.04, 0.08);
    jawBone.rotation.x = 1.35;
    lowerJawGroup.add(jawBone);

    // Glowing Inner Throat Cavity (Illuminates from inside the mouth)
    const throatMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), throatMat);
    throatMesh.position.set(0, 0.02, 0.02);
    lowerJawGroup.add(throatMesh);

    // Lower Razor Fangs (Pointing upward, interlocking with upper teeth)
    [-0.08, -0.04, 0.0, 0.04, 0.08].forEach((lx, idx) => {
      const isBig = idx === 0 || idx === 4;
      const fangLength = isBig ? 0.16 : 0.1;
      const lowerFang = new THREE.Mesh(new THREE.ConeGeometry(0.022, fangLength, 4), fangMat);
      lowerFang.position.set(lx, 0.03 + fangLength * 0.35, 0.14);
      lowerFang.rotation.x = -0.2; // pointing upward into upper teeth
      lowerJawGroup.add(lowerFang);
    });

    // 8. Lateral Razor Mandibles (Snarl open during attacks and roars)
    const mandibleLeft = new THREE.Group();
    const mandibleRight = new THREE.Group();
    mandibleLeft.position.set(-0.16, -0.05, 0.22);
    mandibleRight.position.set(0.16, -0.05, 0.22);
    headGroup.add(mandibleLeft);
    headGroup.add(mandibleRight);

    [-1, 1].forEach((mDir) => {
      const mTarget = mDir === -1 ? mandibleLeft : mandibleRight;
      const mBlade = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.36, 4), boneMat);
      mBlade.position.set(mDir * 0.06, -0.06, 0.06);
      mBlade.rotation.z = mDir * -0.55;
      mBlade.rotation.x = 0.75;
      mTarget.add(mBlade);

      // Serrated inner teeth on mandibles
      [-0.04, 0.04].forEach((sy) => {
        const serration = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.08, 3), fangMat);
        serration.position.set(mDir * 0.02, sy - 0.06, 0.08);
        serration.rotation.z = mDir * 0.7;
        mTarget.add(serration);
      });
    });

    // (D) 4 Biomechanical Arched Back Spines
    const tendrilMeshes: THREE.Mesh[] = [];
    [-0.24, -0.08, 0.08, 0.24].forEach((tX, tIdx) => {
      const tendril = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.012, 0.8, 5), boneMat);
      tendril.position.set(tX, 0.38, -0.24);
      tendril.rotation.x = -0.7;
      tendril.rotation.z = (tIdx - 1.5) * 0.28;
      chestGroup.add(tendril);
      tendrilMeshes.push(tendril);
    });

    // (E) Digitigrade Alien Legs & Talons
    const legLeft = new THREE.Group();
    const legRight = new THREE.Group();

    const buildLeg = (legGroup: THREE.Group, isLeft: boolean) => {
      legGroup.position.set(isLeft ? -0.24 : 0.24, 0.65, 0);

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.48, 6), carapaceMat);
      thigh.position.set(0, -0.22, 0.06);
      thigh.rotation.x = -0.42;
      legGroup.add(thigh);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.52, 6), carapaceMat);
      shin.position.set(0, -0.5, -0.06);
      shin.rotation.x = 0.55;
      legGroup.add(shin);

      // Heavy Talons
      [-0.09, 0, 0.09].forEach((clawX) => {
        const talon = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.25, 4), fangMat);
        talon.position.set(clawX, -0.72, 0.1);
        talon.rotation.x = 1.4;
        legGroup.add(talon);
      });
    };

    buildLeg(legLeft, true);
    buildLeg(legRight, false);
    bossRoot.add(legLeft);
    bossRoot.add(legRight);

    // (F) Dynamic Ground Shadow Plane
    const groundShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.72 })
    );
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = 0.02;
    scene.add(groundShadow);

    // (G) Rising Plasma Particles
    const particleCount = 50;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 1.8;
      particlePositions[i * 3 + 1] = 0.2 + Math.random() * 2.0;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      particleSpeeds[i] = 0.5 + Math.random() * 0.9;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: rimColor,
      size: 0.048,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 4. REAL-TIME ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentHp = hpRef.current;
      const currentState = stateRef.current;

      // Update element colors dynamically
      const curColor = new THREE.Color(archetypeRef.current.primaryColor);
      rimLight.color.lerp(curColor, 0.1);
      coreLight.color.lerp(curColor, 0.1);
      throatLight.color.lerp(curColor, 0.1);
      veinMat.emissive.lerp(curColor, 0.1);
      throatMat.color.lerp(curColor, 0.1);
      particleMat.color.lerp(curColor, 0.1);

      // Core rotation & tendril sway
      coreMesh.rotation.y = elapsedTime * 1.6;
      coreMesh.rotation.x = elapsedTime * 0.9;
      tendrilMeshes.forEach((t, i) => {
        t.rotation.x = -0.7 + Math.sin(elapsedTime * 2.8 + i) * 0.14;
      });

      // Particle floating
      const pos = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += particleSpeeds[i] * 0.009;
        if (pos[i * 3 + 1] > 2.4) {
          pos[i * 3 + 1] = 0.2;
          pos[i * 3 + 0] = (Math.random() - 0.5) * 1.8;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Breathing Cycle & Rage Frequency
      const breathSpeed = currentHp <= 25 ? 5.5 : currentHp <= 50 ? 3.6 : 2.2;
      const breathCycle = Math.sin(elapsedTime * breathSpeed);

      // Core pulse & Throat fire
      coreLight.intensity = (currentHp <= 25 ? 5.0 : 3.5) + breathCycle * 1.4;
      throatLight.intensity = (currentHp <= 25 ? 3.8 : 2.0) + Math.abs(breathCycle) * 1.5;

      // Ground shadow expands/contracts with breathing
      groundShadow.scale.set(1.0 + breathCycle * 0.07, 1.0 + breathCycle * 0.07, 1.0);

      // --- ANGRY COMBAT STATE MACHINE ---
      if (currentState === "DEFEATED" || currentHp <= 0) {
        bossRoot.position.y = THREE.MathUtils.lerp(bossRoot.position.y, -0.4, 0.04);
        bossRoot.rotation.x = THREE.MathUtils.lerp(bossRoot.rotation.x, 0.8, 0.05);
        bossRoot.rotation.z = THREE.MathUtils.lerp(bossRoot.rotation.z, -0.35, 0.05);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.9, 0.06);
        lowerJawGroup.rotation.x = THREE.MathUtils.lerp(lowerJawGroup.rotation.x, 0.85, 0.06);
        coreLight.intensity = THREE.MathUtils.lerp(coreLight.intensity, 0.2, 0.05);
        faceSpotLight.intensity = THREE.MathUtils.lerp(faceSpotLight.intensity, 1.0, 0.05);
      } else if (currentState === "HIT") {
        // Recoil back in fury
        bossRoot.position.z = THREE.MathUtils.lerp(bossRoot.position.z, -0.5, 0.25);
        bossRoot.position.x = THREE.MathUtils.lerp(bossRoot.position.x, 0.4, 0.25);
        bossRoot.rotation.x = THREE.MathUtils.lerp(bossRoot.rotation.x, -0.28, 0.25);
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -0.45, 0.3);
        lowerJawGroup.rotation.x = THREE.MathUtils.lerp(lowerJawGroup.rotation.x, 0.65, 0.3); // Jaws gape open
        mandibleLeft.rotation.z = 0.4;
        mandibleRight.rotation.z = -0.4;
      } else if (currentState === "ATTACK") {
        // Furious lunge & jaw snap forward toward player
        const attackCycle = (elapsedTime * 3.6) % Math.PI;
        const lungeDist = Math.sin(attackCycle) * 1.35;
        bossRoot.position.x = -lungeDist;
        bossRoot.position.z = Math.sin(attackCycle) * 0.45;
        bossRoot.rotation.x = 0.3;

        // Mandibles flare open wide in roar
        lowerJawGroup.rotation.x = 0.75;
        mandibleLeft.rotation.z = 0.65;
        mandibleRight.rotation.z = -0.65;

        // Claws slash forward
        armLeft.rotation.x = -1.5 + Math.sin(attackCycle) * 0.9;
        armRight.rotation.x = -1.5 + Math.sin(attackCycle) * 0.9;
      } else if (currentState === "APPROACH") {
        const stride = Math.sin(elapsedTime * 4.8);
        bossRoot.position.x = THREE.MathUtils.lerp(bossRoot.position.x, -0.45, 0.08);
        bossRoot.rotation.x = 0.22;
        torsoGroup.rotation.z = stride * 0.09;
        legLeft.rotation.x = stride * 0.4;
        legRight.rotation.x = -stride * 0.4;
        lowerJawGroup.rotation.x = 0.25 + Math.abs(stride) * 0.15; // Snarling steps
      } else {
        // IDLE: Menacing posture, angry furrowed brow, predatory head twitch
        bossRoot.position.x = THREE.MathUtils.lerp(bossRoot.position.x, 0, 0.08);
        bossRoot.position.y = THREE.MathUtils.lerp(bossRoot.position.y, 0, 0.08);
        bossRoot.position.z = THREE.MathUtils.lerp(bossRoot.position.z, 0, 0.08);
        bossRoot.rotation.x = currentHp <= 25 ? 0.26 : 0.06;

        // Chest & shoulder heave
        chestGroup.position.y = 0.44 + breathCycle * 0.045;
        shoulderLeft.rotation.z = breathCycle * 0.065;
        shoulderRight.rotation.z = -breathCycle * 0.065;

        // Predatory Head glances with sudden angry lock-on twitches
        const isTracking = Math.sin(elapsedTime * 0.9) > 0.8;
        headGroup.rotation.y = isTracking ? Math.sin(elapsedTime * 6.5) * 0.2 : 0;
        headGroup.rotation.x = -0.06 + breathCycle * 0.035;

        // Snarl jaw breathing: mouth opens and closes revealing the sharp fangs!
        lowerJawGroup.rotation.x = currentHp <= 25 ? 0.26 + Math.abs(breathCycle) * 0.18 : 0.12 + Math.abs(breathCycle) * 0.1;
        mandibleLeft.rotation.z = Math.sin(elapsedTime * 2.0) * 0.12;
        mandibleRight.rotation.z = -Math.sin(elapsedTime * 2.0) * 0.12;
      }

      renderer.render(scene, camera);
    };

    animate();

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
      bumpMap.dispose();
      carapaceMat.dispose();
      boneMat.dispose();
      fangMat.dispose();
      veinMat.dispose();
      eyeMat.dispose();
      throatMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-68 h-76 sm:w-84 sm:h-[400px] lg:w-[410px] lg:h-[450px] flex items-center justify-center select-none pointer-events-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
