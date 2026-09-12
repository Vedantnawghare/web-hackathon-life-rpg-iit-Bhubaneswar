"use client";

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { getHeroArchetype, HeroArchetype } from "@/lib/hero-data";

export type HeroCombatState =
  | "IDLE"
  | "READY"
  | "APPROACH"
  | "ATTACK"
  | "ATTACK_COMBO"
  | "ATTACK_FINISHER"
  | "HIT"
  | "VICTORY"
  | "DODGE";

interface Hero3DModelProps {
  heroId?: string;
  state?: HeroCombatState;
  equippedTheme?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showShadow?: boolean;
}

/**
 * Procedurally generates an armor & fabric detail bump map
 */
function createHeroBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 512, 512);

  // Fine fabric weave & leather grain
  ctx.fillStyle = "#8c8c8c";
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Armor plate seams and filigree lines
  ctx.strokeStyle = "#404040";
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const y = i * 25;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function Hero3DModel({
  heroId = "vanguard_male",
  state = "IDLE",
  equippedTheme = "default_slate",
  className = "",
  size = "lg",
  showShadow = true,
}: Hero3DModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef(state);
  const heroIdRef = useRef(heroId);
  const themeRef = useRef(equippedTheme);

  stateRef.current = state;
  heroIdRef.current = heroId;
  themeRef.current = equippedTheme;

  const hero: HeroArchetype = useMemo(() => {
    return getHeroArchetype(heroId);
  }, [heroId]);

  const heroRef = useRef(hero);
  heroRef.current = hero;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 420;

    const scene = new THREE.Scene();

    // Matching cinematic camera staging to boss
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0.0, 1.15, 4.8);
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

    // --- 1. LIGHTING RIG (Cinematic Sunset / Arena Key) ---
    const ambientLight = new THREE.AmbientLight(0x283050, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e0, 3.2);
    keyLight.position.set(3.5, 5.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Dynamic class rim light
    const classColor = new THREE.Color(hero.primaryColor);
    const rimLight = new THREE.DirectionalLight(classColor, 3.8);
    rimLight.position.set(-3.5, 3.0, -2.5);
    scene.add(rimLight);

    // Under-chest heroic fill light
    const fillLight = new THREE.PointLight(classColor, 1.8, 5);
    fillLight.position.set(0, 0.5, 1.2);
    scene.add(fillLight);

    // Hero weapon / spell glow spotlight
    const weaponLight = new THREE.PointLight(classColor, 2.5, 4);
    weaponLight.position.set(0.4, 1.1, 0.5);
    scene.add(weaponLight);

    // --- 2. MATERIALS & TEXTURES ---
    const bumpMap = createHeroBumpTexture();

    // Realistic human skin tones
    const skinColor =
      hero.id === "vanguard_male"
        ? 0xe2a884 // Valen: heroic warm tan
        : hero.id === "rogue_male"
        ? 0xd8b598 // Kaelen: pale shadow tone
        : hero.id === "mage_female"
        ? 0xf4d3c2 // Lyra: alabaster fair
        : 0xdfa57f; // Aria: sun-kissed sylvan

    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.65,
      metalness: 0.05,
      bumpMap: bumpMap,
      bumpScale: 0.003,
    });

    // Hair materials
    const hairColor =
      hero.id === "vanguard_male"
        ? 0x2a1d17 // Valen: dark knight brown
        : hero.id === "rogue_male"
        ? 0x15161b // Kaelen: jet raven black
        : hero.id === "mage_female"
        ? 0xd8dff0 // Lyra: platinum silver
        : 0x7c2d12; // Aria: vibrant sylvan auburn

    const hairMat = new THREE.MeshStandardMaterial({
      color: hairColor,
      roughness: 0.7,
      metalness: 0.1,
    });

    // Eye Materials
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisColor =
      hero.id === "vanguard_male"
        ? 0xd97706 // Amber
        : hero.id === "rogue_male"
        ? 0x06b6d4 // Cyan glow
        : hero.id === "mage_female"
        ? 0xa855f7 // Arcane violet
        : 0x10b981; // Emerald green

    const eyeIrisMat = new THREE.MeshStandardMaterial({
      color: irisColor,
      emissive: irisColor,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    // Armor & Cloth Materials
    const armorMetalMat = new THREE.MeshStandardMaterial({
      color: hero.id === "vanguard_male" ? 0x94a3b8 : hero.id === "rogue_male" ? 0x1e293b : 0xd1d5db,
      metalness: hero.id === "rogue_male" ? 0.35 : 0.85,
      roughness: hero.id === "rogue_male" ? 0.45 : 0.25,
      bumpMap: bumpMap,
      bumpScale: 0.008,
    });

    const armorTrimMat = new THREE.MeshStandardMaterial({
      color: hero.id === "vanguard_male" ? 0xf59e0b : hero.id === "rogue_male" ? 0x06b6d4 : hero.id === "mage_female" ? 0xc084fc : 0x34d399,
      metalness: 0.75,
      roughness: 0.3,
      emissive: classColor,
      emissiveIntensity: 0.25,
    });

    const clothPrimaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hero.primaryColor),
      roughness: 0.85,
      metalness: 0.08,
      bumpMap: bumpMap,
      bumpScale: 0.006,
    });

    const clothDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.1,
      bumpMap: bumpMap,
      bumpScale: 0.005,
    });

    const weaponSteelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    });

    const weaponGlowMat = new THREE.MeshStandardMaterial({
      color: classColor,
      emissive: classColor,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.2,
    });

    // --- 3. CHARACTER HIERARCHY RIG ---
    const isMale = hero.gender === "male";
    const heroRoot = new THREE.Group();
    scene.add(heroRoot);

    // (A) Pelvis / Hips
    const pelvis = new THREE.Group();
    pelvis.position.set(0, 0.85, 0);
    heroRoot.add(pelvis);

    const hipWidth = isMale ? 0.30 : 0.26;
    const hipMesh = new THREE.Mesh(
      new THREE.BoxGeometry(hipWidth, 0.18, isMale ? 0.22 : 0.20),
      armorMetalMat
    );
    pelvis.add(hipMesh);

    // Belt & Buckle
    const beltMesh = new THREE.Mesh(new THREE.BoxGeometry(hipWidth + 0.03, 0.06, 0.24), armorTrimMat);
    beltMesh.position.y = 0.08;
    pelvis.add(beltMesh);

    // Front/Back Cloth Tabard
    const tabard = new THREE.Mesh(new THREE.BoxGeometry(isMale ? 0.18 : 0.14, 0.42, 0.02), clothPrimaryMat);
    tabard.position.set(0, -0.16, 0.12);
    pelvis.add(tabard);

    // (B) Spine & Chest
    const spine = new THREE.Group();
    spine.position.set(0, 0.16, 0);
    pelvis.add(spine);

    const chestGroup = new THREE.Group();
    chestGroup.position.set(0, 0.22, 0);
    spine.add(chestGroup);

    // Chestplate / Cuirass (Proportions tuned for male Vanguard/Rogue vs female Mage/Ranger)
    const chestWidth = isMale ? 0.42 : 0.32;
    const chestDepth = isMale ? 0.26 : 0.22;
    const chestMesh = new THREE.Mesh(
      new THREE.BoxGeometry(chestWidth, 0.32, chestDepth),
      armorMetalMat
    );
    chestGroup.add(chestMesh);

    // Breastplate Emblem / Sigil
    const crestMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.02, 6),
      armorTrimMat
    );
    crestMesh.position.set(0, 0.04, chestDepth * 0.5 + 0.01);
    crestMesh.rotation.x = Math.PI / 2;
    chestGroup.add(crestMesh);

    // Hero Cape / Cloak
    const capeGroup = new THREE.Group();
    capeGroup.position.set(0, 0.15, -chestDepth * 0.5 - 0.02);
    chestGroup.add(capeGroup);

    const capeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(isMale ? 0.38 : 0.32, 0.85, 0.02),
      clothPrimaryMat
    );
    capeMesh.position.set(0, -0.42, -0.06);
    capeMesh.rotation.x = 0.12;
    capeGroup.add(capeMesh);

    // (C) Neck & Realistic Head Rig
    const neck = new THREE.Group();
    neck.position.set(0, 0.24, 0);
    chestGroup.add(neck);

    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 8), skinMat);
    neck.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.12, 0.02);
    neck.add(headGroup);

    // Cranium / Face Base
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(isMale ? 0.125 : 0.115, 16, 16),
      skinMat
    );
    headMesh.scale.set(1.0, 1.25, 1.1);
    headGroup.add(headMesh);

    // Sculpted Jaw & Chin
    const jawMesh = new THREE.Mesh(
      new THREE.BoxGeometry(isMale ? 0.14 : 0.11, 0.08, 0.12),
      skinMat
    );
    jawMesh.position.set(0, -0.1, 0.04);
    headGroup.add(jawMesh);

    // Nose Bridge
    const noseMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.07, 4),
      skinMat
    );
    noseMesh.position.set(0, 0.01, 0.14);
    noseMesh.rotation.x = 0.35;
    headGroup.add(noseMesh);

    // Eyes with Lids & Glowing Irises
    [-0.045, 0.045].forEach((eyeX) => {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeWhiteMat);
      eyeWhite.position.set(eyeX, 0.04, 0.115);
      headGroup.add(eyeWhite);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), eyeIrisMat);
      iris.position.set(eyeX, 0.04, 0.128);
      headGroup.add(iris);
    });

    // Hair Sculpt / Headgear
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    if (hero.id === "vanguard_male") {
      // Valen: Swept-back dark knight hair + winged steel circlet
      const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), hairMat);
      hairTop.position.set(0, 0.06, -0.02);
      hairTop.scale.set(1.02, 1.05, 1.15);
      hairGroup.add(hairTop);

      const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 6, 16), armorTrimMat);
      circlet.position.set(0, 0.05, 0.02);
      circlet.rotation.x = Math.PI / 2;
      hairGroup.add(circlet);
    } else if (hero.id === "rogue_male") {
      // Kaelen: Assassin Cowl & Hood framing the glowing cyan eyes
      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 14), clothDarkMat);
      hood.position.set(0, 0.04, -0.04);
      hood.scale.set(1.08, 1.25, 1.25);
      hairGroup.add(hood);

      const cowlMantle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.15, 10), clothDarkMat);
      cowlMantle.position.set(0, -0.1, 0);
      hairGroup.add(cowlMantle);
    } else if (hero.id === "mage_female") {
      // Lyra: Arcane Star Tiara + Platinum braided hair
      const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 14), hairMat);
      hairBase.position.set(0, 0.05, -0.04);
      hairBase.scale.set(1.02, 1.1, 1.2);
      hairGroup.add(hairBase);

      const tiara = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.016, 6, 16), armorTrimMat);
      tiara.position.set(0, 0.07, 0.03);
      tiara.rotation.x = Math.PI / 2;
      hairGroup.add(tiara);

      // Star crystal on forehead
      const tiaraGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), weaponGlowMat);
      tiaraGem.position.set(0, 0.1, 0.14);
      hairGroup.add(tiaraGem);
    } else {
      // Aria: Sylvan Auburn ponytail with leather headband
      const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), hairMat);
      hairBase.position.set(0, 0.04, -0.03);
      hairGroup.add(hairBase);

      const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.01, 0.38, 6), hairMat);
      ponytail.position.set(0, 0.08, -0.18);
      ponytail.rotation.x = -0.55;
      hairGroup.add(ponytail);

      const headband = new THREE.Mesh(new THREE.TorusGeometry(0.122, 0.014, 6, 16), armorTrimMat);
      headband.position.set(0, 0.05, 0.02);
      headband.rotation.x = Math.PI / 2;
      hairGroup.add(headband);
    }

    // (D) Shoulders & Arms Rig
    const shoulderLeft = new THREE.Group();
    const shoulderRight = new THREE.Group();
    const shoulderSpan = chestWidth * 0.5 + 0.06;
    shoulderLeft.position.set(-shoulderSpan, 0.12, 0);
    shoulderRight.position.set(shoulderSpan, 0.12, 0);
    chestGroup.add(shoulderLeft);
    chestGroup.add(shoulderRight);

    // Pauldrons (Left & Right)
    [-1, 1].forEach((dir) => {
      const sGroup = dir === -1 ? shoulderLeft : shoulderRight;
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(isMale ? 0.12 : 0.095, 8, 8),
        armorMetalMat
      );
      pauldron.scale.set(1.1, 0.9, 1.2);
      pauldron.position.set(dir * 0.04, 0.04, 0);
      sGroup.add(pauldron);
    });

    // Upper Arms
    const armUpperLeft = new THREE.Group();
    const armUpperRight = new THREE.Group();
    shoulderLeft.add(armUpperLeft);
    shoulderRight.add(armUpperRight);

    const armMeshGeo = new THREE.CylinderGeometry(0.06, 0.052, 0.28, 8);
    const aMeshL = new THREE.Mesh(armMeshGeo, armorMetalMat);
    aMeshL.position.y = -0.14;
    armUpperLeft.add(aMeshL);

    const aMeshR = new THREE.Mesh(armMeshGeo, armorMetalMat);
    aMeshR.position.y = -0.14;
    armUpperRight.add(aMeshR);

    // Forearms & Hands
    const forearmLeft = new THREE.Group();
    const forearmRight = new THREE.Group();
    forearmLeft.position.set(0, -0.28, 0);
    forearmRight.position.set(0, -0.28, 0);
    armUpperLeft.add(forearmLeft);
    armUpperRight.add(forearmRight);

    const forearmGeo = new THREE.CylinderGeometry(0.052, 0.045, 0.26, 8);
    const fMeshL = new THREE.Mesh(forearmGeo, armorTrimMat);
    fMeshL.position.y = -0.13;
    forearmLeft.add(fMeshL);

    const fMeshR = new THREE.Mesh(forearmGeo, armorTrimMat);
    fMeshR.position.y = -0.13;
    forearmRight.add(fMeshR);

    const handLeft = new THREE.Group();
    const handRight = new THREE.Group();
    handLeft.position.set(0, -0.26, 0);
    handRight.position.set(0, -0.26, 0);
    forearmLeft.add(handLeft);
    forearmRight.add(handRight);

    const handGeo = new THREE.BoxGeometry(0.065, 0.08, 0.055);
    handLeft.add(new THREE.Mesh(handGeo, skinMat));
    handRight.add(new THREE.Mesh(handGeo, skinMat));

    // (E) Legs & Feet Rig
    const hipJointLeft = new THREE.Group();
    const hipJointRight = new THREE.Group();
    const legSpacing = hipWidth * 0.32;
    hipJointLeft.position.set(-legSpacing, -0.08, 0);
    hipJointRight.position.set(legSpacing, -0.08, 0);
    pelvis.add(hipJointLeft);
    pelvis.add(hipJointRight);

    const buildLeg = (hipJoint: THREE.Group) => {
      const thigh = new THREE.Group();
      hipJoint.add(thigh);

      const thighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.38, 8), clothDarkMat);
      thighMesh.position.y = -0.19;
      thigh.add(thighMesh);

      const shin = new THREE.Group();
      shin.position.set(0, -0.38, 0);
      thigh.add(shin);

      const shinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.40, 8), armorMetalMat);
      shinMesh.position.y = -0.2;
      shin.add(shinMesh);

      // Sabatons / Boots
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.18), armorTrimMat);
      foot.position.set(0, -0.42, 0.05);
      shin.add(foot);

      return { thigh, shin };
    };

    const legL = buildLeg(hipJointLeft);
    const legR = buildLeg(hipJointRight);

    // =========================================================================
    // (F) CLASS-SPECIFIC PHYSICALLY ATTACHED & ANIMATED WEAPONS
    // =========================================================================
    const weaponRig: {
      update: (time: number, combatState: HeroCombatState) => void;
    } = { update: () => {} };

    if (hero.id === "vanguard_male") {
      // 1. VALEN — HEAVY SOLAR CLAYMORE
      const swordGroup = new THREE.Group();
      swordGroup.position.set(0, 0, 0.02);
      handRight.add(swordGroup);

      // Grip
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8), clothDarkMat);
      grip.position.y = 0.12;
      swordGroup.add(grip);

      // Pommel Sun Gem
      const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), weaponGlowMat);
      pommel.position.y = -0.03;
      swordGroup.add(pommel);

      // Crossguard
      const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.06), armorTrimMat);
      crossguard.position.y = 0.27;
      swordGroup.add(crossguard);

      // Long Double-Edged Blade
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.15, 0.02), weaponSteelMat);
      blade.position.y = 0.86;
      swordGroup.add(blade);

      // Runic Core Fuller Channel
      const bladeCore = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.05, 0.025), weaponGlowMat);
      bladeCore.position.y = 0.86;
      swordGroup.add(bladeCore);

      weaponRig.update = (time, cState) => {
        if (cState === "ATTACK" || cState === "ATTACK_COMBO" || cState === "ATTACK_FINISHER") {
          swordGroup.rotation.x = Math.sin(time * 14) * 0.4;
        } else {
          swordGroup.rotation.set(0.1, 0, 0);
        }
      };
    } else if (hero.id === "rogue_male") {
      // 2. KAELEN — DUAL ARC DAGGERS (Right: Forward grip, Left: Reverse grip)
      const buildDagger = (isReverse: boolean) => {
        const dGroup = new THREE.Group();
        const dGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.16, 8), clothDarkMat);
        dGrip.position.y = isReverse ? -0.06 : 0.06;
        dGroup.add(dGrip);

        const dGuard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.04), armorTrimMat);
        dGuard.position.y = isReverse ? -0.14 : 0.14;
        dGroup.add(dGuard);

        const dBlade = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.48, 4), weaponGlowMat);
        dBlade.position.y = isReverse ? -0.38 : 0.38;
        dBlade.rotation.x = isReverse ? Math.PI : 0;
        dGroup.add(dBlade);
        return dGroup;
      };

      const daggerR = buildDagger(false);
      const daggerL = buildDagger(true);
      handRight.add(daggerR);
      handLeft.add(daggerL);

      weaponRig.update = (time, cState) => {
        if (cState === "ATTACK" || cState === "ATTACK_COMBO") {
          daggerR.rotation.z = Math.sin(time * 16) * 0.6;
          daggerL.rotation.z = -Math.cos(time * 16) * 0.6;
        } else {
          daggerR.rotation.set(0.15, 0, 0);
          daggerL.rotation.set(-0.25, 0, 0);
        }
      };
    } else if (hero.id === "mage_female") {
      // 3. LYRA — STARFALL RUNIC STAFF (Right hand, spinning arcane orb at tip)
      const staffGroup = new THREE.Group();
      handRight.add(staffGroup);

      const staffShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.018, 1.45, 8),
        armorTrimMat
      );
      staffShaft.position.y = 0.35;
      staffGroup.add(staffShaft);

      // Arcane Crescent Finial Head
      const finial = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), armorTrimMat);
      finial.position.y = 1.05;
      staffGroup.add(finial);

      // Spinning Core Arcane Orb
      const crystalOrb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 1), weaponGlowMat);
      crystalOrb.position.y = 1.05;
      staffGroup.add(crystalOrb);

      weaponRig.update = (time) => {
        crystalOrb.rotation.y = time * 3.5;
        crystalOrb.rotation.x = time * 2.0;
      };
    } else {
      // 4. ARIA — MYSTIC RECURVE BOW & QUIVER
      // Quiver on chest back
      const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.48, 6), clothDarkMat);
      quiver.position.set(0.12, 0.05, -chestDepth * 0.5 - 0.08);
      quiver.rotation.z = -0.4;
      quiver.rotation.x = 0.2;
      chestGroup.add(quiver);

      // 3 Arrows protruding from quiver
      for (let a = 0; a < 3; a++) {
        const arrowMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 4), weaponSteelMat);
        arrowMesh.position.set(0.1 + a * 0.025, 0.2 + a * 0.04, -chestDepth * 0.5 - 0.08);
        arrowMesh.rotation.z = -0.4;
        arrowMesh.rotation.x = 0.2;
        chestGroup.add(arrowMesh);
      }

      // Recurve Bow in Left Hand
      const bowGroup = new THREE.Group();
      bowGroup.position.set(0, 0, 0.04);
      handLeft.add(bowGroup);

      const bowLimbTop = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.008, 0.55, 6), armorTrimMat);
      bowLimbTop.position.set(0, 0.25, 0.08);
      bowLimbTop.rotation.x = 0.35;
      bowGroup.add(bowLimbTop);

      const bowLimbBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.008, 0.55, 6), armorTrimMat);
      bowLimbBottom.position.set(0, -0.25, 0.08);
      bowLimbBottom.rotation.x = -0.35;
      bowGroup.add(bowLimbBottom);

      // Bowstring
      const stringGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.48, 0.16),
        new THREE.Vector3(0, 0, 0.0),
        new THREE.Vector3(0, -0.48, 0.16),
      ]);
      const stringMat = new THREE.LineBasicMaterial({ color: 0xffffff });
      const bowString = new THREE.Line(stringGeo, stringMat);
      bowGroup.add(bowString);

      // Drawn Arrow in Hand during Attack
      const arrowMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.72, 4), weaponSteelMat);
      arrowMesh.rotation.x = Math.PI / 2;
      arrowMesh.position.set(0, 0, 0.35);
      arrowMesh.visible = false;
      bowGroup.add(arrowMesh);

      weaponRig.update = (time, cState) => {
        const isAttacking = cState === "ATTACK" || cState === "ATTACK_COMBO";
        arrowMesh.visible = isAttacking;
        bowGroup.rotation.x = isAttacking ? 0.2 : 0;
      };
    }

    // --- (G) GROUND SHADOW & RUNIC CONTACT RING ---
    const groundShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.72 })
    );
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = 0.02;
    groundShadow.visible = showShadow;
    scene.add(groundShadow);

    const runeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.75, 32),
      new THREE.MeshBasicMaterial({
        color: classColor,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      })
    );
    runeRing.rotation.x = -Math.PI / 2;
    runeRing.position.y = 0.03;
    runeRing.visible = showShadow;
    scene.add(runeRing);

    // --- 4. REAL-TIME ANIMATION LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentState = stateRef.current;
      const curHero = heroRef.current;

      weaponRig.update(elapsedTime, currentState);

      // Breathing Cycle
      const breath = Math.sin(elapsedTime * 2.2);
      chestGroup.position.y = 0.22 + breath * 0.015;
      shoulderLeft.rotation.z = breath * 0.035;
      shoulderRight.rotation.z = -breath * 0.035;
      groundShadow.scale.set(1.0 + breath * 0.05, 1.0 + breath * 0.05, 1.0);
      runeRing.rotation.z = elapsedTime * 0.35;

      // Cape Physics fluttering in wind
      capeGroup.rotation.x = 0.12 + Math.sin(elapsedTime * 3.5) * 0.08;

      // --- STATE-BASED COMBAT LOOPS ---
      if (currentState === "ATTACK" || currentState === "ATTACK_COMBO" || currentState === "ATTACK_FINISHER") {
        const attackCycle = Math.sin(elapsedTime * 12);

        if (curHero.weaponType === "sword") {
          // Valen: Two-handed heavy claymore cleave
          heroRoot.position.x = THREE.MathUtils.lerp(heroRoot.position.x, 0.25, 0.2);
          heroRoot.rotation.y = THREE.MathUtils.lerp(heroRoot.rotation.y, 0.25, 0.2);
          shoulderRight.rotation.x = -1.2 + attackCycle * 0.8;
          shoulderLeft.rotation.x = -1.1 + attackCycle * 0.8;
          forearmRight.rotation.x = -0.5;
          forearmLeft.rotation.x = -0.5;
          spine.rotation.x = 0.2 + attackCycle * 0.15;
        } else if (curHero.weaponType === "dual_blades") {
          // Kaelen: Agile twin blade cross-slash
          heroRoot.position.x = THREE.MathUtils.lerp(heroRoot.position.x, 0.35, 0.25);
          shoulderRight.rotation.x = -1.4 + Math.sin(elapsedTime * 16) * 0.9;
          shoulderRight.rotation.z = -0.5;
          shoulderLeft.rotation.x = -1.2 - Math.cos(elapsedTime * 16) * 0.9;
          shoulderLeft.rotation.z = 0.5;
          spine.rotation.y = Math.sin(elapsedTime * 16) * 0.3;
        } else if (curHero.weaponType === "staff") {
          // Lyra: Spellcast staff thrust
          heroRoot.position.y = 0.15 + Math.sin(elapsedTime * 4.0) * 0.08; // Levitating higher
          shoulderRight.rotation.x = -1.5;
          shoulderRight.rotation.y = -0.2;
          shoulderLeft.rotation.x = -1.2;
          shoulderLeft.rotation.z = 0.6;
          weaponLight.intensity = 5.0 + Math.sin(elapsedTime * 25) * 3.0;
        } else {
          // Aria: Draw & Release bow
          shoulderLeft.rotation.x = -1.55; // Arm raised straight aiming at boss
          shoulderLeft.rotation.y = 0.2;
          shoulderRight.rotation.x = -1.2; // Arm drawing string back to cheek
          shoulderRight.rotation.z = -0.6;
          forearmRight.rotation.x = -1.1;
        }
      } else if (currentState === "APPROACH") {
        const walkCycle = Math.sin(elapsedTime * 6.0);
        heroRoot.position.x = THREE.MathUtils.lerp(heroRoot.position.x, 0.15, 0.1);
        spine.rotation.x = 0.12;
        legL.thigh.rotation.x = walkCycle * 0.45;
        legR.thigh.rotation.x = -walkCycle * 0.45;
        shoulderLeft.rotation.x = -walkCycle * 0.35;
        shoulderRight.rotation.x = walkCycle * 0.35;
      } else if (currentState === "HIT") {
        // Stagger recoil
        heroRoot.position.x = THREE.MathUtils.lerp(heroRoot.position.x, -0.3, 0.3);
        heroRoot.rotation.z = THREE.MathUtils.lerp(heroRoot.rotation.z, 0.25, 0.3);
        spine.rotation.x = -0.3;
        headGroup.rotation.x = -0.35;
        shoulderLeft.rotation.z = 0.6;
        shoulderRight.rotation.z = -0.6;
      } else if (currentState === "DODGE") {
        // Agile evasive backflip / duck
        heroRoot.position.x = THREE.MathUtils.lerp(heroRoot.position.x, -0.35, 0.2);
        heroRoot.position.y = THREE.MathUtils.lerp(heroRoot.position.y, -0.15, 0.2);
        spine.rotation.x = 0.35;
        legL.thigh.rotation.x = -0.4;
        legR.thigh.rotation.x = 0.3;
      } else if (currentState === "VICTORY") {
        // Triumphant salute
        heroRoot.position.x = THREE.MathUtils.lerp(heroRoot.position.x, 0, 0.1);
        heroRoot.rotation.y = THREE.MathUtils.lerp(heroRoot.rotation.y, 0, 0.1);
        shoulderRight.rotation.x = -2.6; // High salute in the air
        shoulderRight.rotation.z = -0.2;
        shoulderLeft.rotation.z = 0.4;
        headGroup.rotation.x = -0.2;
        weaponLight.intensity = 4.0;
      } else {
        // IDLE / READY Stance
        heroRoot.position.x = THREE.MathUtils.lerp(heroRoot.position.x, 0, 0.08);
        heroRoot.position.y = THREE.MathUtils.lerp(heroRoot.position.y, 0, 0.08);
        heroRoot.rotation.y = THREE.MathUtils.lerp(heroRoot.rotation.y, 0.12, 0.08);
        heroRoot.rotation.z = THREE.MathUtils.lerp(heroRoot.rotation.z, 0, 0.08);
        spine.rotation.x = 0;
        spine.rotation.y = 0;
        headGroup.rotation.x = 0;
        weaponLight.intensity = 2.0;

        legL.thigh.rotation.x = 0;
        legR.thigh.rotation.x = 0;

        if (curHero.weaponType === "sword") {
          shoulderRight.rotation.x = -0.6;
          shoulderRight.rotation.z = -0.2;
          shoulderLeft.rotation.x = -0.3;
          shoulderLeft.rotation.z = 0.2;
          forearmRight.rotation.x = -0.4;
        } else if (curHero.weaponType === "dual_blades") {
          shoulderRight.rotation.x = -0.5;
          shoulderRight.rotation.z = -0.3;
          shoulderLeft.rotation.x = -0.5;
          shoulderLeft.rotation.z = 0.3;
        } else if (curHero.weaponType === "staff") {
          // Lyra floating hover
          heroRoot.position.y = 0.06 + Math.sin(elapsedTime * 2.5) * 0.04;
          shoulderRight.rotation.x = -0.7;
          shoulderLeft.rotation.z = 0.4 + breath * 0.05;
        } else {
          shoulderLeft.rotation.x = -0.6;
          shoulderRight.rotation.x = -0.3;
          shoulderRight.rotation.z = -0.2;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 320;
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
      skinMat.dispose();
      hairMat.dispose();
      eyeWhiteMat.dispose();
      eyeIrisMat.dispose();
      armorMetalMat.dispose();
      armorTrimMat.dispose();
      clothPrimaryMat.dispose();
      clothDarkMat.dispose();
      weaponSteelMat.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hero.id, showShadow]);

  const sizeClasses = {
    sm: "w-32 h-44",
    md: "w-44 h-60 sm:w-52 sm:h-72",
    lg: "w-60 h-80 sm:w-72 sm:h-96",
    xl: "w-72 h-96 sm:w-80 sm:h-[420px]",
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-none ${sizeClasses[size]} ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
