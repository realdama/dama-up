// Argo Maris · "Il pescato": viaggio 3D guidato dallo scroll (three.js, tutto procedurale).
// Nave portacontainer vista dall'alto → tuffo sott'acqua tra le famiglie di pesce → cassa al box del CAR.
import * as THREE from './vendor/three.module.min.js';

const section = document.querySelector('.catch');
const canvas = section && section.querySelector('.catch-canvas');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (section && canvas && webgl && !reduce) start();

function start() {
  section.classList.add('live');
  const small = innerWidth < 760;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const C = {
    navy: 0x0a1a3d, deep: 0x041226, sea: 0x0f3d73, seaLight: 0x2a6fb0, yellow: 0xffd21f, white: 0xf3f6fa,
    red: 0xb8362b, blue: 0x1d5fd1, cyan: 0x3fd6f5, silver: 0xc9d3de, sand: 0x2b3b52,
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 900);
  const fogAbove = new THREE.Fog(0x0b1d44, 80, 320);
  const fogBelow = new THREE.FogExp2(0x062a52, 0.028);

  // ambiente per i riflessi (cielo sfumato + sole), generato una volta
  {
    const envScene = new THREE.Scene();
    const g = new THREE.SphereGeometry(10, 32, 16); const cols = [];
    const cTop = new THREE.Color(0xcfe4ff), cMid = new THREE.Color(0x2a5fa8), cLow = new THREE.Color(0x061428);
    for (let i = 0; i < g.attributes.position.count; i++) { const y = g.attributes.position.getY(i) / 10; const c = y > 0 ? cMid.clone().lerp(cTop, Math.pow(y, 0.7)) : cMid.clone().lerp(cLow, Math.min(1, -y * 2)); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const sunPatch = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 8), new THREE.MeshBasicMaterial({ color: 0xfff4dc })); sunPatch.position.set(-5, 7, 3); envScene.add(sunPatch);
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, 0.035).texture; pm.dispose();
  }

  // luci
  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x0a1a3d, 0.7); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d6, 1.7); sun.position.set(-40, 80, 30); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x6fb6ff, 0.9); rim.position.set(30, 20, -60); scene.add(rim);

  // cielo: cupola con sfumatura
  const skyGeo = new THREE.SphereGeometry(500, 32, 16);
  const skyCol = []; const top = new THREE.Color(0x050d24), hor = new THREE.Color(0x1d4fa8);
  for (let i = 0; i < skyGeo.attributes.position.count; i++) { const y = skyGeo.attributes.position.getY(i) / 500; const c = hor.clone().lerp(top, Math.min(1, Math.max(0, y * 1.6))); skyCol.push(c.r, c.g, c.b); }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyCol, 3));
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }));
  scene.add(sky);

  // oceano low-poly (onde calcolate sulla CPU, sfaccettato)
  const seg = small ? 70 : 110;
  const oceanGeo = new THREE.PlaneGeometry(420, 420, seg, seg); oceanGeo.rotateX(-Math.PI / 2);
  const oceanBase = oceanGeo.attributes.position.array.slice();
  const ocean = new THREE.Mesh(oceanGeo, new THREE.MeshStandardMaterial({ color: C.sea, roughness: 0.42, metalness: 0.25, flatShading: true, envMapIntensity: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.96 }));
  ocean.position.z = -60; scene.add(ocean);
  const waves = t => {
    const a = oceanGeo.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) {
      const x = oceanBase[i], z = oceanBase[i + 2];
      a[i + 1] = Math.sin(x * 0.07 + t * 0.9) * 0.55 + Math.cos(z * 0.09 + t * 0.7) * 0.5 + Math.sin((x + z) * 0.16 + t * 1.6) * 0.18;
    }
    oceanGeo.attributes.position.needsUpdate = true; oceanGeo.computeVertexNormals();
  };

  // fondale
  const bedGeo = new THREE.PlaneGeometry(260, 360, 60, 80); bedGeo.rotateX(-Math.PI / 2);
  { const a = bedGeo.attributes.position.array; for (let i = 0; i < a.length; i += 3) a[i + 1] = Math.sin(a[i] * 0.11) * 1.2 + Math.cos(a[i + 2] * 0.08) * 1.4 + (Math.random() - 0.5) * 0.6; bedGeo.computeVertexNormals(); }
  const bed = new THREE.Mesh(bedGeo, new THREE.MeshStandardMaterial({ color: C.sand, roughness: 1, flatShading: true }));
  bed.position.set(0, -24, -110); scene.add(bed);

  // ---------------------------------------------------------- nave portacontainer
  const ship = new THREE.Group(); scene.add(ship);
  const hullShape = new THREE.Shape([[-4.2, -22], [4.2, -22], [4.4, 12], [2.6, 19], [0, 23], [-2.6, 19], [-4.4, 12]].map(([x, z]) => new THREE.Vector2(x, z)));
  const lower = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape, { depth: 1.6, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.7 }));
  const upper = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape, { depth: 2.4, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: C.navy, roughness: 0.55, metalness: 0.2 }));
  [lower, upper].forEach(m => { m.rotation.x = Math.PI / 2; });
  lower.position.y = -0.4; upper.position.y = 2.0; lower.scale.z = 1; ship.add(lower, upper);
  // ExtrudeGeometry estrude lungo +z: ruotata di 90° scende verso -y; posiziono i due strati
  lower.position.y = 0.6; upper.position.y = 3.0;
  const deck = new THREE.Mesh(new THREE.ShapeGeometry(hullShape), new THREE.MeshStandardMaterial({ color: 0x1b2b4f, roughness: 0.8, side: THREE.DoubleSide }));
  deck.rotation.x = Math.PI / 2; deck.position.y = 3.02; ship.add(deck);
  // nome sullo scafo, sui due fianchi
  {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 128; const x = cv.getContext('2d');
    x.font = 'italic 800 92px Archivo, "Arial Narrow", sans-serif'; x.textBaseline = 'middle';
    x.fillStyle = '#f3f6fa'; x.fillText('ARGO', 24, 66); const w = x.measureText('ARGO ').width; x.fillStyle = '#ffd21f'; x.fillText('MARIS', 24 + w, 66);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const geo = new THREE.PlaneGeometry(16, 2);
    const sb = new THREE.Mesh(geo, mat); sb.position.set(4.38, 1.8, 3); sb.rotation.y = Math.PI / 2; ship.add(sb);
    const pt = new THREE.Mesh(geo, mat); pt.position.set(-4.38, 1.8, 3); pt.rotation.y = -Math.PI / 2; ship.add(pt);
  }
  // container
  const boxGeo = new THREE.BoxGeometry(2.35, 2.3, 5.6);
  const palette = [C.yellow, C.white, C.red, C.blue, C.navy, 0x2f8f6f, C.cyan, 0xd8682e].map(c => new THREE.Color(c));
  const slots = []; for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) for (let lv = 0; lv < 3; lv++) if (!(lv === 2 && (row + col) % 3 === 0)) slots.push([col, row, lv]);
  const boxes = new THREE.InstancedMesh(boxGeo, new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.35, flatShading: true }), slots.length);
  const m4 = new THREE.Matrix4(); const tmpC = new THREE.Color();
  slots.forEach(([col, row, lv], i) => { m4.makeTranslation((col - 1) * 2.45, 4.2 + lv * 2.34, -15 + row * 5.9); boxes.setMatrixAt(i, m4); boxes.setColorAt(i, tmpC.copy(palette[(i * 7 + lv * 3) % palette.length])); });
  ship.add(boxes);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(8, 5.5, 3.2), new THREE.MeshStandardMaterial({ color: C.white, roughness: 0.4 }));
  bridge.position.set(0, 5.8, -19.6); ship.add(bridge);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(8.05, 0.8, 3.25), new THREE.MeshStandardMaterial({ color: 0x0b1530, roughness: 0.15, metalness: 0.6 }));
  glass.position.set(0, 7.6, -19.6); ship.add(glass);
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 2.4, 12), new THREE.MeshStandardMaterial({ color: C.yellow }));
  funnel.position.set(0, 9.6, -20.4); ship.add(funnel);
  // scia
  const wakeGeo = new THREE.PlaneGeometry(10, 60, 4, 20); wakeGeo.rotateX(-Math.PI / 2);
  const wake = new THREE.Mesh(wakeGeo, new THREE.MeshBasicMaterial({ color: 0xdfeefe, transparent: true, opacity: 0.22, depthWrite: false }));
  wake.position.set(0, 0.35, -52); scene.add(wake);

  // ---------------------------------------------------------- utilità geometrie
  function merge(geos) {
    const pos = [], nor = [], col = [];
    for (const g0 of geos) {
      const g = g0.index ? g0.toNonIndexed() : g0; g.computeVertexNormals();
      pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array);
      const c = g0.userData.color || new THREE.Color(1, 1, 1);
      if (g0.attributes.color && !g0.userData.color) col.push(...g.attributes.color.array); else for (let i = 0; i < g.attributes.position.count; i++) col.push(c.r, c.g, c.b);
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return out;
  }
  const tint = (g, c) => { g.userData.color = new THREE.Color(c); return g; };
  function shadeByY(g, back, belly) { // dorso scuro, ventre argento
    g.computeBoundingBox(); const { min, max } = g.boundingBox; const a = g.attributes.position; const col = [];
    const cb = new THREE.Color(back), cv = new THREE.Color(belly);
    for (let i = 0; i < a.count; i++) { const t = (a.getY(i) - min.y) / (max.y - min.y || 1); const c = cv.clone().lerp(cb, THREE.MathUtils.smoothstep(t, 0.35, 0.75)); col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return g;
  }
  function fishGeo({ len = 1, h = 0.32, w = 0.16, back = 0x1d4f7a, belly = 0xdfe6ee, tail = 'fork', fin = 0x1d3d66 }) {
    const prof = []; const N = 22;
    for (let i = 0; i <= N; i++) { const t = i / N; const r = 0.5 * Math.pow(Math.sin(Math.PI * t), 0.55) * (1 - 0.72 * t * t); prof.push(new THREE.Vector2(Math.max(r, i === 0 || i === N ? 0 : 0.012), 0.5 - t)); }
    const body = new THREE.LatheGeometry(prof, 16); body.rotateZ(-Math.PI / 2); body.scale(len, h, w); shadeByY(body, back, belly);
    const ts = new THREE.Shape();
    if (tail === 'moon') { ts.moveTo(0, 0); ts.quadraticCurveTo(-0.25 * len, 0.1, -0.42 * len, 0.48 * h * 2); ts.quadraticCurveTo(-0.22 * len, 0, -0.42 * len, -0.48 * h * 2); ts.quadraticCurveTo(-0.25 * len, -0.1, 0, 0); }
    else { ts.moveTo(0, 0); ts.lineTo(-0.3 * len, 0.36 * h * 2); ts.lineTo(-0.22 * len, 0); ts.lineTo(-0.3 * len, -0.36 * h * 2); ts.lineTo(0, 0); }
    const tg = new THREE.ExtrudeGeometry(ts, { depth: w * 0.12, bevelEnabled: false }); tg.translate(-len * 0.44, 0, -w * 0.06); tint(tg, fin);
    const fs = new THREE.Shape(); fs.moveTo(-0.15 * len, 0); fs.lineTo(0.05 * len, 0.22 * h * 2); fs.lineTo(0.15 * len, 0); fs.lineTo(-0.15 * len, 0);
    const fg = new THREE.ExtrudeGeometry(fs, { depth: w * 0.1, bevelEnabled: false }); fg.translate(0, h * 0.42, -w * 0.05); tint(fg, fin);
    const eye = new THREE.SphereGeometry(0.045 * len, 6, 6); eye.translate(len * 0.36, h * 0.08, w * 0.4); tint(eye, 0x05070c);
    const eye2 = eye.clone(); eye2.translate(0, 0, -w * 0.8); tint(eye2, 0x05070c);
    return merge([body, tg, fg, eye, eye2]);
  }
  function shrimpGeo() {
    const parts = []; const n = 8;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1); const ang = Math.PI * 0.95 * t; const r = 0.7;
      const s = new THREE.SphereGeometry(0.2 * (1 - t * 0.55), 10, 8); s.scale(1.25, 1, 0.9);
      s.translate(Math.cos(ang) * r - r, Math.sin(ang) * r * 0.85, 0); tint(s, i % 2 ? 0xe2552b : 0xf06a3a); parts.push(s);
    }
    const fan = new THREE.ConeGeometry(0.16, 0.32, 6); fan.scale(1.4, 1, 0.3); fan.rotateZ(Math.PI * 0.6); fan.translate(-1.38, 0.1, 0); tint(fan, 0xd2452a); parts.push(fan);
    for (const z of [-0.05, 0.05]) {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.12, 0.22, z), new THREE.Vector3(0.7, 0.5, z * 2), new THREE.Vector3(0.55, 1.05, z * 5), new THREE.Vector3(-0.5, 1.35, z * 9), new THREE.Vector3(-1.4, 1.2, z * 12)]);
      const a = new THREE.TubeGeometry(curve, 24, 0.014, 3); tint(a, 0xf38a5c); parts.push(a);
    }
    for (let k = 0; k < 5; k++) { const leg = new THREE.CylinderGeometry(0.012, 0.008, 0.32, 3); leg.rotateZ(0.5); leg.translate(-0.25 - k * 0.14, -0.12, 0); tint(leg, 0xf06a3a); parts.push(leg); }
    const eye = new THREE.SphereGeometry(0.05, 6, 6); eye.translate(0.12, 0.14, 0.12); tint(eye, 0x05070c); parts.push(eye);
    return merge(parts);
  }
  function musselGeo() {
    const a = new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2); a.scale(1, 0.32, 0.55); tint(a, 0x101a2e);
    const b = a.clone(); b.rotateX(Math.PI); b.translate(0, -0.02, 0); tint(b, 0x0c1424);
    return merge([a, b]);
  }

  // ---------------------------------------------------------- stazioni sott'acqua
  const ST = [0, -45, -90, -135, -180]; const Y = -12;
  const fishMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.7, flatShading: true, envMapIntensity: 1.3 });
  const swimTime = { value: 0 };
  function swimMat(len, amp, freq, speed) {
    const m = fishMat.clone();
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uTime: swimTime, uLen: { value: len }, uAmp: { value: amp }, uFreq: { value: freq }, uSpeed: { value: speed } });
      sh.vertexShader = 'uniform float uTime, uLen, uAmp, uFreq, uSpeed;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float ph = instanceMatrix[3].x * 0.9 + instanceMatrix[3].z * 0.6;
        #else
          float ph = 0.0;
        #endif
        float wgt = smoothstep(0.15 * uLen, -0.55 * uLen, position.x);
        transformed.z += sin(position.x / uLen * uFreq - uTime * uSpeed + ph) * uAmp * uLen * wgt * wgt;`);
    };
    m.customProgramCacheKey = () => 'swim' + len;
    return m;
  }
  const dummy = new THREE.Object3D();
  const groups = [];

  // 1 pesce azzurro: banco a vortice
  const nBlue = small ? 90 : 170;
  const blue = new THREE.InstancedMesh(fishGeo({ len: 1.2, h: 0.28, w: 0.14, back: 0x1f6a8a, belly: 0xe6edf3, fin: 0x1d4f6a }), swimMat(1.2, 0.12, 6, 9), nBlue);
  const blueSeed = Array.from({ length: nBlue }, () => [Math.random() * Math.PI * 2, 3 + Math.random() * 4, (Math.random() - 0.5) * 6, 0.5 + Math.random() * 0.5]);
  scene.add(blue); groups.push({ z: ST[0], update(t) { blueSeed.forEach(([a0, r, dy, sp], i) => { const a = a0 + t * sp * 0.6; dummy.position.set(Math.cos(a) * r, Y + dy + Math.sin(a * 2 + i) * 0.4, ST[0] + Math.sin(a) * r); dummy.rotation.set(0, -a - Math.PI / 2, Math.sin(t * 8 + i) * 0.08); dummy.updateMatrix(); blue.setMatrixAt(i, dummy.matrix); }); blue.instanceMatrix.needsUpdate = true; } });

  // 2 pesce bianco: orate e spigole che girano lente
  const white = new THREE.InstancedMesh(fishGeo({ len: 2.2, h: 0.9, w: 0.32, back: 0x7c8a99, belly: 0xf2f4f6, fin: 0x55606d }), swimMat(2.2, 0.08, 5, 4), 22);
  const whiteSeed = Array.from({ length: 22 }, () => [Math.random() * Math.PI * 2, 4 + Math.random() * 5, (Math.random() - 0.5) * 5]);
  scene.add(white); groups.push({ z: ST[1], update(t) { whiteSeed.forEach(([a0, r, dy], i) => { const a = a0 + t * 0.22 * (i % 2 ? 1 : -1); dummy.position.set(Math.cos(a) * r, Y + dy, ST[1] + Math.sin(a) * r); dummy.rotation.set(0, i % 2 ? -a - Math.PI / 2 : -a + Math.PI / 2, Math.sin(t * 3 + i) * 0.06); dummy.updateMatrix(); white.setMatrixAt(i, dummy.matrix); }); white.instanceMatrix.needsUpdate = true; } });

  // 3 tonni: grandi, in fila che attraversa
  const tuna = new THREE.InstancedMesh(fishGeo({ len: 6.5, h: 1.6, w: 1.2, back: 0x0d1f4a, belly: 0xd5dde6, tail: 'moon', fin: 0x0b1838 }), swimMat(6.5, 0.06, 4.5, 3), 6);
  scene.add(tuna); groups.push({ z: ST[2], update(t) { for (let i = 0; i < 6; i++) { const x = ((t * 3.2 + i * 11) % 66) - 33; dummy.position.set(x, Y + (i % 3 - 1) * 2.6 + Math.sin(t + i) * 0.4, ST[2] + (i % 2 ? 3 : -3)); dummy.rotation.set(0, 0, Math.sin(t * 4 + i) * 0.03); dummy.updateMatrix(); tuna.setMatrixAt(i, dummy.matrix); } tuna.instanceMatrix.needsUpdate = true; } });

  // 4 crostacei: gamberi sospesi che ruotano
  const nShr = 28;
  const shrimp = new THREE.InstancedMesh(shrimpGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.1, flatShading: true }), nShr);
  const shrSeed = Array.from({ length: nShr }, () => [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8, Math.random() * 6]);
  scene.add(shrimp); groups.push({ z: ST[3], update(t) { shrSeed.forEach(([x, y, z, ph], i) => { dummy.position.set(x, Y + y + Math.sin(t * 0.8 + ph) * 0.5, ST[3] + z); dummy.rotation.set(Math.sin(t * 0.5 + ph) * 0.3, t * 0.3 + ph, 0.2); dummy.scale.setScalar(1.3); dummy.updateMatrix(); shrimp.setMatrixAt(i, dummy.matrix); }); dummy.scale.setScalar(1); shrimp.instanceMatrix.needsUpdate = true; } });

  // 5 molluschi: polpo + cozze sul fondale
  const octo = new THREE.Group(); octo.position.set(0, -15.5, ST[4]); scene.add(octo);
  const octoMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.05, flatShading: true });
  // mantello: goccia inclinata all'indietro, più chiara sopra, con gli occhi
  const mantle = new THREE.LatheGeometry(Array.from({ length: 17 }, (_, i) => { const t = i / 16; return new THREE.Vector2(Math.max(0.001, 1.25 * Math.pow(Math.sin(Math.PI * t), 0.7) * (0.75 + 0.35 * t)), 3.4 * (1 - t)); }), 18);
  shadeByY(mantle, 0xd07a62, 0x8e3b33); mantle.rotateX(-0.45); mantle.translate(0, 0.9, -0.5);
  const eyes = [-0.62, 0.62].flatMap(x => { const w = new THREE.SphereGeometry(0.26, 10, 8); w.translate(x, 1.2, 0.72); tint(w, 0xf3e3c8); const p = new THREE.SphereGeometry(0.13, 8, 6); p.translate(x * 1.08, 1.22, 0.92); tint(p, 0x0b0b10); return [w, p]; });
  const headMesh = new THREE.Mesh(merge([mantle, ...eyes]), octoMat); octo.add(headMesh);
  // tentacoli affusolati: catena di sfere lungo una curva che si arriccia in punta
  const tentacles = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const ca = Math.cos(a), sa = Math.sin(a);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ca * 0.5, 0.6, sa * 0.5), new THREE.Vector3(ca * 1.6, -0.4, sa * 1.6), new THREE.Vector3(ca * 3.0, -1.2, sa * 3.0),
      new THREE.Vector3(Math.cos(a + 0.35) * 4.3, -0.9, Math.sin(a + 0.35) * 4.3), new THREE.Vector3(Math.cos(a + 0.75) * 4.6, 0.1, Math.sin(a + 0.75) * 4.6), new THREE.Vector3(Math.cos(a + 0.95) * 4.0, 0.5, Math.sin(a + 0.95) * 4.0)]);
    const parts = []; const n = 30;
    for (let k = 0; k < n; k++) {
      const t = k / (n - 1); const p = curve.getPointAt(t); const r = 0.42 * (1 - t) + 0.05;
      const s = new THREE.SphereGeometry(r, 8, 6); s.translate(p.x, p.y, p.z); tint(s, new THREE.Color(0xb4554a).lerp(new THREE.Color(0xe7a48a), t * 0.6)); parts.push(s);
      if (k % 3 === 1 && t < 0.85) { const su = new THREE.SphereGeometry(r * 0.38, 6, 4); su.translate(p.x, p.y - r * 0.85, p.z); tint(su, 0xf2c9b0); parts.push(su); }
    }
    const tm = new THREE.Mesh(merge(parts), octoMat); octo.add(tm); tentacles.push(tm);
  }
  const nMus = 26; const mussels = new THREE.InstancedMesh(musselGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.4, flatShading: true }), nMus);
  for (let i = 0; i < nMus; i++) { const a = Math.random() * Math.PI * 2, r = 5 + Math.random() * 6; dummy.position.set(Math.cos(a) * r, -21.6, ST[4] + Math.sin(a) * r); dummy.rotation.set(0.2, Math.random() * 6, 0.3); dummy.scale.setScalar(1.6); dummy.updateMatrix(); mussels.setMatrixAt(i, dummy.matrix); }
  dummy.scale.setScalar(1); scene.add(mussels);
  groups.push({ z: ST[4], update(t) { octo.rotation.y = t * 0.15; tentacles.forEach((m, i) => { m.rotation.x = Math.sin(t * 1.2 + i) * 0.08; m.rotation.z = Math.cos(t * 1.1 + i) * 0.08; }); octo.position.y = -15.5 + Math.sin(t * 0.7) * 0.4; } });

  // raggi di luce dalla superficie
  const rayTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(200,230,255,0.9)'); g.addColorStop(1, 'rgba(200,230,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 256); const h = x.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 64, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const rays = new THREE.Group(); scene.add(rays);
  const rayMat = new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (let i = 0; i < (small ? 14 : 26); i++) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(2 + Math.random() * 4, 34), rayMat);
    r.position.set((Math.random() - 0.5) * 50, -17, 15 - Math.random() * 215); r.userData.sway = Math.random() * 6; r.rotation.z = (Math.random() - 0.5) * 0.25; rays.add(r);
  }

  // plancton / bolle
  const nP = small ? 500 : 1100; const pGeo = new THREE.BufferGeometry(); const pp = new Float32Array(nP * 3);
  for (let i = 0; i < nP; i++) { pp[i * 3] = (Math.random() - 0.5) * 70; pp[i * 3 + 1] = -22 + Math.random() * 21; pp[i * 3 + 2] = 20 - Math.random() * 230; }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const plankton = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xa8d8ff, size: 0.12, transparent: true, opacity: 0.7, depthWrite: false })); scene.add(plankton);

  // ---------------------------------------------------------- il box al CAR (studio in alto)
  const SY = 300; const studio = new THREE.Group(); studio.position.y = SY; scene.add(studio);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0x0c1d42, roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; studio.add(floor);
  const grid = new THREE.GridHelper(80, 40, 0xffd21f, 0x1d4fa8); grid.material.transparent = true; grid.material.opacity = 0.35; grid.position.y = 0.02; studio.add(grid);
  const poly = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 0.95 });
  const crate = new THREE.Group(); studio.add(crate);
  [[0, 0.15, 0, 6, 0.3, 4], [0, 1.1, 1.9, 6, 2.2, 0.3], [0, 1.1, -1.9, 6, 2.2, 0.3], [2.85, 1.1, 0, 0.3, 2.2, 4], [-2.85, 1.1, 0, 0.3, 2.2, 4]].forEach(([x, y, z, w, h, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), poly); m.position.set(x, y, z); crate.add(m); });
  const ice = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), new THREE.MeshStandardMaterial({ color: 0xdff4ff, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.75 }), 120);
  for (let i = 0; i < 120; i++) { dummy.position.set((Math.random() - 0.5) * 5.2, 0.5 + Math.random() * 0.8, (Math.random() - 0.5) * 3.3); dummy.rotation.set(Math.random(), Math.random(), Math.random()); dummy.updateMatrix(); ice.setMatrixAt(i, dummy.matrix); }
  crate.add(ice);
  const lying = new THREE.InstancedMesh(fishGeo({ len: 1.8, h: 0.42, w: 0.2, back: 0x1f6a8a, belly: 0xe6edf3, fin: 0x1d4f6a }), fishMat, 7);
  for (let i = 0; i < 7; i++) { dummy.position.set(-2 + i * 0.66, 1.45, (i % 2 ? 0.5 : -0.4)); dummy.rotation.set(Math.PI / 2, 0, (i % 2 ? 0.25 : -0.2) + Math.PI / 2); dummy.updateMatrix(); lying.setMatrixAt(i, dummy.matrix); }
  crate.add(lying);
  const lyShrimp = new THREE.InstancedMesh(shrimpGeo(), shrimp.material, 5);
  for (let i = 0; i < 5; i++) { dummy.position.set(-1.6 + i * 0.85, 1.75, 1.1); dummy.rotation.set(-Math.PI / 2, 0, 0.3); dummy.updateMatrix(); lyShrimp.setMatrixAt(i, dummy.matrix); }
  crate.add(lyShrimp);
  // container refrigerato con il logo
  const reefer = new THREE.Group(); reefer.position.set(-1, 0, -9); studio.add(reefer);
  const rb = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 5.6), new THREE.MeshStandardMaterial({ color: C.white, roughness: 0.45, metalness: 0.2 })); rb.position.y = 3; reefer.add(rb);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(14.05, 0.5, 5.65), new THREE.MeshStandardMaterial({ color: C.yellow })); stripe.position.y = 1.2; reefer.add(stripe);
  const logoTex = new THREE.TextureLoader().load('img/logo.png', tx => { tx.colorSpace = THREE.SRGBColorSpace; });
  const logo = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true })); logo.position.set(-3.5, 3.5, 2.82); reefer.add(logo);
  const ribs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 5.4, 0.1), new THREE.MeshStandardMaterial({ color: 0xd9e0e8 }), 24);
  for (let i = 0; i < 24; i++) { dummy.position.set(1 + i * 0.25, 3, 2.84); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); ribs.setMatrixAt(i, dummy.matrix); }
  reefer.add(ribs);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.05, 8, 96), new THREE.MeshBasicMaterial({ color: C.yellow })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; studio.add(ring);
  const studioLight = new THREE.PointLight(0xfff3d0, 60, 40); studioLight.position.set(4, 10, 6); studio.add(studioLight);

  scene.traverse(o => { if (o.isInstancedMesh) o.frustumCulled = false; });

  // ---------------------------------------------------------- percorso della camera
  const S = (z, side = 1, y = -9) => [[9 * side, y, z + 18], [0, Y, z]];
  const keys = [
    [0.00, [0, 72, 4], [0, 0, 0]],
    [0.10, [-28, 34, 30], [0, 2, 0]],
    [0.18, [-6, 5, 44], [0, 0, 6]],
    [0.235, ...S(ST[0], -1, -7)], [0.32, ...S(ST[0], 1)],
    [0.37, ...S(ST[1], -1)], [0.44, ...S(ST[1], 1)],
    [0.49, ...S(ST[2], 1, -10)], [0.56, ...S(ST[2], -1, -10)],
    [0.61, ...S(ST[3], 1, -10)], [0.68, ...S(ST[3], -1, -10)],
    [0.73, [8, -12, ST[4] + 16], [0, -16, ST[4]]], [0.82, [-8, -11, ST[4] + 15], [0, -16, ST[4]]],
    [0.845, [-8, -11, ST[4] + 15], [0, -16, ST[4]], 'cut'],
    [0.86, [13, SY + 8, 15], [0, SY + 1.5, -1]],
    [1.00, [-12, SY + 6, 13], [0, SY + 1.5, -2]],
  ];
  const ease = t => t * t * (3 - 2 * t);
  const camAt = p => {
    let i = 0; while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
    const [p0, a0, l0] = keys[i]; const [p1, a1, l1, cut] = keys[i + 1];
    let t = Math.min(1, Math.max(0, (p - p0) / (p1 - p0 || 1)));
    if (cut) t = t < 1 ? 0 : 1; else t = ease(t);
    return [a0.map((v, k) => v + (a1[k] - v) * t), l0.map((v, k) => v + (l1[k] - v) * t)];
  };

  // ---------------------------------------------------------- scroll, capitoli, render
  const chapters = [...section.querySelectorAll('.chapter')];
  const rail = [...section.querySelectorAll('.catch-rail button')];
  const fade = section.querySelector('.catch-fade');
  const intro = section.querySelector('.catch-intro');
  let progress = 0, visible = false, last = performance.now(), clock = 0;
  const readScroll = () => {
    const r = section.getBoundingClientRect(); const span = r.height - innerHeight;
    progress = Math.min(1, Math.max(0, -r.top / (span || 1)));
  };
  rail.forEach(b => b.addEventListener('click', () => {
    const r = section.getBoundingClientRect(); const span = r.height - innerHeight;
    scrollTo({ top: scrollY + r.top + span * +b.dataset.go, behavior: 'smooth' });
  }));
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 58 : 42; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  addEventListener('scroll', readScroll, { passive: true }); readScroll();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(frame); } }, { rootMargin: '100px' }).observe(section);

  const motionOn = () => document.documentElement.dataset.motion !== 'off';
  function frame(now) {
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; if (motionOn() && !document.hidden) clock += dt;
    const t = clock;
    const [pos, look] = camAt(progress);
    // piccolo ondeggiare della camera sopra l'acqua
    camera.position.set(pos[0], pos[1] + (pos[1] > 0 && pos[1] < 60 ? Math.sin(t * 0.8) * 0.3 : 0), pos[2]);
    camera.lookAt(look[0], look[1], look[2]);
    const under = camera.position.y < 0.2 && camera.position.y > -100;
    scene.fog = under ? fogBelow : fogAbove;
    renderer.setClearColor(under ? 0x062a52 : 0x050d24);
    sky.visible = !under; ocean.material.color.setHex(under ? C.seaLight : C.sea);
    // aggiorna solo ciò che serve
    if (camera.position.y > -40 && camera.position.y < 120) {
      waves(t * 1.0);
      ship.position.y = Math.sin(t * 0.9) * 0.25; ship.rotation.z = Math.sin(t * 0.7) * 0.02;
    }
    const camZ = camera.position.z;
    groups.forEach(g => { if (Math.abs(camZ - g.z) < 75 && under) g.update(t); });
    plankton.position.y = (t * 0.25) % 2;
    swimTime.value = t;
    rays.visible = under;
    if (under) rays.children.forEach(r => { r.rotation.y = Math.atan2(camera.position.x - r.position.x, camera.position.z - r.position.z); r.scale.x = 1 + Math.sin(t * 0.6 + r.userData.sway) * 0.25; });
    studio.visible = camera.position.y > 200; crate.rotation.y = Math.sin(t * 0.3) * 0.15;
    // capitoli
    chapters.forEach(ch => {
      const a = +ch.dataset.from, b = +ch.dataset.to;
      const o = Math.min(1, Math.max(0, Math.min((progress - a) / 0.02, (b - progress) / 0.02)));
      ch.style.opacity = o; ch.style.transform = `translateY(${(1 - o) * 14}px)`; ch.classList.toggle('on', o > 0.5);
    });
    intro.style.opacity = Math.max(0, Math.min(1, (0.17 - progress) / 0.03));
    const ci = chapters.findIndex(ch => ch.classList.contains('on'));
    rail.forEach((b, i) => b.setAttribute('aria-current', i === ci ? 'step' : 'false'));
    fade.style.opacity = progress > 0.815 && progress < 0.87 ? Math.min(1, Math.min((progress - 0.815) / 0.02, (0.87 - progress) / 0.015)) : 0;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
}
