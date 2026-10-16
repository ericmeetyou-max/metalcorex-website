import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onloadend = null;
      this.onerror = null;
    }

    async readAsArrayBuffer(blob) {
      try {
        this.result = await blob.arrayBuffer();
        this.onloadend?.();
      } catch (error) {
        this.onerror?.(error);
      }
    }
  };
}

const outDir = path.resolve("website/assets/models");
const sourceDir = path.resolve("website/assets/model-sources");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(sourceDir, { recursive: true });

const scene = new THREE.Scene();
scene.name = "Metalcorex_PA_15inch_Exploded_Speaker_Assembly";
scene.userData = {
  title: "Metalcorex self-built professional 15-inch PA speaker exploded assembly",
  license: "CC0-1.0 / Metalcorex-created procedural model",
  author: "Metalcorex / Codex",
  notes: "No third-party brand logos. Built as a manufacturable component visualization for the Metalcorex Precision website."
};

const mat = {
  cabinet: new THREE.MeshStandardMaterial({ color: 0x1a2021, roughness: 0.88, metalness: 0.03 }),
  cabinetEdge: new THREE.MeshStandardMaterial({ color: 0x050708, roughness: 0.72, metalness: 0.08 }),
  grille: new THREE.MeshStandardMaterial({ color: 0x101516, roughness: 0.44, metalness: 0.86, side: THREE.DoubleSide, transparent: true, opacity: 0.88, depthWrite: false }),
  grilleEdge: new THREE.MeshStandardMaterial({ color: 0x7d878a, roughness: 0.26, metalness: 0.92 }),
  shadow: new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.9, metalness: 0.0 }),
  foam: new THREE.MeshStandardMaterial({ color: 0x090a0a, roughness: 0.96, metalness: 0.0 }),
  cone: new THREE.MeshStandardMaterial({ color: 0x30383b, roughness: 0.74, metalness: 0.08 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x030404, roughness: 0.86, metalness: 0.0 }),
  aluminum: new THREE.MeshStandardMaterial({ color: 0xaebdc1, roughness: 0.28, metalness: 0.88 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x525c60, roughness: 0.35, metalness: 0.85 }),
  plastic: new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 0.66, metalness: 0.03 }),
  horn: new THREE.MeshStandardMaterial({ color: 0x060708, roughness: 0.58, metalness: 0.02 }),
  pcb: new THREE.MeshStandardMaterial({ color: 0x14372d, roughness: 0.68, metalness: 0.05 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb77938, roughness: 0.35, metalness: 0.75 }),
  pinBlue: new THREE.MeshStandardMaterial({ color: 0x0d9fd3, roughness: 0.32, metalness: 0.68, emissive: 0x004b68, emissiveIntensity: 0.08 }),
  metalcorexBlue: new THREE.MeshStandardMaterial({ color: 0x222b2e, roughness: 0.48, metalness: 0.58, emissive: 0x002b3c, emissiveIntensity: 0.03 })
};

const makePart = (name, category, metalcorex, description, explode, children = []) => {
  const group = new THREE.Group();
  group.name = name;
  group.userData = { category, metalcorexManufacturable: metalcorex, description, explode };
  children.forEach((child) => group.add(child));
  scene.add(group);
  return group;
};

const box = (name, size, material, position = [0, 0, 0], rotation = [0, 0, 0]) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return mesh;
};

const roundedBox = (name, size, radius, material, position = [0, 0, 0], rotation = [0, 0, 0], segments = 3) => {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return mesh;
};

const loadObjAsMesh = (filePath, name, material, targetSize, position = [0, 0, 0], rotation = [0, 0, 0]) => {
  if (!fs.existsSync(filePath)) return null;
  const object = new OBJLoader().parse(fs.readFileSync(filePath, "utf8"));
  const group = new THREE.Group();
  group.name = name;
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const scale = targetSize / Math.max(size.x, size.y, size.z);
  object.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry.clone();
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `${name}_mesh`;
      mesh.scale.setScalar(scale);
      group.add(mesh);
    }
  });
  group.position.set(...position);
  group.rotation.set(...rotation);
  return group;
};

const trapezoidPrism = (name, bottomWidth, topWidth, height, depth, material, position = [0, 0, 0]) => {
  const shape = new THREE.Shape();
  shape.moveTo(-bottomWidth / 2, -height / 2);
  shape.lineTo(bottomWidth / 2, -height / 2);
  shape.lineTo(topWidth / 2, height / 2);
  shape.lineTo(-topWidth / 2, height / 2);
  shape.lineTo(-bottomWidth / 2, -height / 2);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2 });
  geometry.center();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  return mesh;
};

const perforatedTrapezoidPlate = (name, bottomWidth, topWidth, height, depth, holeRadius, material, position = [0, 0, 0]) => {
  const shape = new THREE.Shape();
  shape.moveTo(-bottomWidth / 2, -height / 2);
  shape.lineTo(bottomWidth / 2, -height / 2);
  shape.lineTo(topWidth / 2, height / 2);
  shape.lineTo(-topWidth / 2, height / 2);
  shape.lineTo(-bottomWidth / 2, -height / 2);

  for (let iy = -18; iy <= 18; iy += 1) {
    const y = iy * 0.105;
    const t = (y + height / 2) / height;
    const half = (bottomWidth * (1 - t) + topWidth * t) / 2 - 0.18;
    for (let ix = -13; ix <= 13; ix += 1) {
      const x = ix * 0.105 + (iy % 2 ? 0.052 : 0);
      if (Math.abs(x) > half || Math.abs(y) > height / 2 - 0.18) continue;
      const hole = new THREE.Path();
      hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 1,
  curveSegments: 6
  });
  geometry.center();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  return mesh;
};

const cyl = (name, radiusTop, radiusBottom, depth, material, position = [0, 0, 0], rotation = [Math.PI / 2, 0, 0], segments = 64, openEnded = false) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, depth, segments, 1, openEnded), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return mesh;
};

const torus = (name, radius, tube, material, position = [0, 0, 0], rotation = [0, 0, 0], radialSegments = 20, tubularSegments = 96) => {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return mesh;
};

const cableCurve = (name, points, material, radius = 0.018) => {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, radius, 8, false), material);
  mesh.name = name;
  return mesh;
};

const roundedCorner = (name, x, y) => {
  const corner = new THREE.Group();
  corner.name = name;
  corner.add(roundedBox(`${name}_wraparound_rubber_cap`, [0.38, 0.38, 0.32], 0.075, mat.plastic, [x, y, 0.04]));
  corner.add(box(`${name}_front_face_plate`, [0.28, 0.18, 0.05], mat.cabinetEdge, [x - Math.sign(x) * 0.035, y - Math.sign(y) * 0.055, 0.235]));
  corner.add(cyl(`${name}_screw_1`, 0.035, 0.035, 0.03, mat.steel, [x - Math.sign(x) * 0.08, y, 0.2], [Math.PI / 2, 0, 0], 20));
  corner.add(cyl(`${name}_screw_2`, 0.035, 0.035, 0.03, mat.steel, [x, y - Math.sign(y) * 0.08, 0.2], [Math.PI / 2, 0, 0], 20));
  return corner;
};

const screwAt = (name, x, y, z, radius = 0.035) => cyl(name, radius, radius, 0.035, mat.steel, [x, y, z], [Math.PI / 2, 0, 0], 20);

const cabinet = makePart("Cabinet", "Wood enclosure", false, "Trapezoid professional PA speaker cabinet with front baffle, rear cavity, and stage-ready rubber feet.", [0, 0, -1.8], [
  trapezoidPrism("Trapezoid_cabinet_shell", 3.15, 2.55, 4.65, 1.45, mat.cabinet, [0, 0, -0.72]),
  trapezoidPrism("Recessed_front_baffle", 2.72, 2.28, 4.18, 0.1, mat.cabinetEdge, [0, -0.02, 0.055]),
  trapezoidPrism("Textured_molded_front_baffle", 2.48, 2.14, 3.86, 0.045, mat.plastic, [0, -0.02, 0.18]),
  box("Left_visible_wedge_side", [0.14, 4.35, 1.22], mat.cabinet, [-1.47, -0.02, -0.48], [0, 0.04, -0.04]),
  box("Right_visible_wedge_side", [0.14, 4.35, 1.22], mat.cabinet, [1.47, -0.02, -0.48], [0, -0.04, 0.04]),
  roundedBox("Upper_horn_recess_real_opening", [1.86, 0.78, 0.07], 0.08, mat.shadow, [0, 1.22, 0.26]),
  roundedBox("Lower_woofer_round_recess_shadow", [2.28, 2.28, 0.055], 0.22, mat.shadow, [0, -0.62, 0.26]),
  torus("Baffle_visible_woofer_mount_ring", 1.12, 0.05, mat.rubber, [0, -0.62, 0.33]),
  torus("Baffle_dark_bolt_circle", 1.0, 0.012, mat.cabinetEdge, [0, -0.62, 0.365]),
  cyl("Baffle_dark_woofer_dust_cap_seen_front", 0.28, 0.28, 0.035, mat.rubber, [0, -0.62, 0.39], [Math.PI / 2, 0, 0], 72),
  roundedBox("Left_low_frequency_slot_port", [0.58, 0.18, 0.08], 0.06, mat.shadow, [-0.55, -1.83, 0.31]),
  roundedBox("Right_low_frequency_slot_port", [0.58, 0.18, 0.08], 0.06, mat.shadow, [0.55, -1.83, 0.31]),
  box("Front_center_divider_shadow", [2.5, 0.08, 0.065], mat.shadow, [0, 0.37, 0.16]),
  box("Front_left_rubber_bezel", [0.13, 4.24, 0.12], mat.rubber, [-1.43, 0, 0.26], [0, 0, -0.065]),
  box("Front_right_rubber_bezel", [0.13, 4.24, 0.12], mat.rubber, [1.43, 0, 0.26], [0, 0, 0.065]),
  box("Front_top_rubber_bezel", [2.48, 0.13, 0.12], mat.rubber, [0, 2.12, 0.26]),
  box("Front_bottom_rubber_bezel", [2.86, 0.13, 0.12], mat.rubber, [0, -2.12, 0.26]),
  roundedBox("Top_recess_shadow", [2.15, 0.18, 0.06], 0.05, mat.shadow, [0, 2.08, 0.13]),
  screwAt("Baffle_screw_top_left", -1.15, 1.88, 0.18),
  screwAt("Baffle_screw_top_right", 1.15, 1.88, 0.18),
  screwAt("Baffle_screw_bottom_left", -1.22, -1.86, 0.18),
  screwAt("Baffle_screw_bottom_right", 1.22, -1.86, 0.18),
  box("Left_rubber_foot", [0.36, 0.12, 0.2], mat.rubber, [-0.72, -2.42, -0.35]),
  box("Right_rubber_foot", [0.36, 0.12, 0.2], mat.rubber, [0.72, -2.42, -0.35])
]);

const grille = makePart("Perforated_Steel_Grille", "Sheet metal", true, "Powder-coated perforated steel grille, a Metalcorex sheet metal part.", [0, 0, 1.95], [
  perforatedTrapezoidPlate("Dense_true_round_hole_perforated_grille_sheet", 2.82, 2.34, 4.12, 0.035, 0.024, mat.grille, [0, 0, 0.49]),
  box("Grille_top_frame", [2.55, 0.12, 0.1], mat.grilleEdge, [0, 2.08, 0.51]),
  box("Grille_bottom_frame", [2.88, 0.12, 0.1], mat.grilleEdge, [0, -2.08, 0.51]),
  box("Grille_center_reinforcing_rib", [2.66, 0.085, 0.1], mat.grilleEdge, [0, 0.37, 0.525]),
  box("Grille_left_frame", [0.12, 4.08, 0.1], mat.grilleEdge, [-1.36, 0, 0.51], [0, 0, -0.065]),
  box("Grille_right_frame", [0.12, 4.08, 0.1], mat.grilleEdge, [1.36, 0, 0.51], [0, 0, 0.065]),
  screwAt("Grille_screw_top_left", -1.1, 1.82, 0.58, 0.028),
  screwAt("Grille_screw_top_right", 1.1, 1.82, 0.58, 0.028),
  screwAt("Grille_screw_bottom_left", -1.18, -1.82, 0.58, 0.028),
  screwAt("Grille_screw_bottom_right", 1.18, -1.82, 0.58, 0.028)
]);

makePart("Acoustic_Foam", "Acoustic material", false, "Open-cell acoustic foam layer behind the grille.", [0, 0, 1.38], [
  box("Dark_acoustic_foam_visible_through_holes", [2.62, 3.96, 0.018], mat.foam, [0, 0, 0.06])
]);

const woofer = makePart("Woofer_15in_Driver", "Purchased driver assembly", false, "15-inch low-frequency driver assembly reference.", [0, -0.82, 0.98], []);
woofer.add(torus("Woofer_outer_rubber_surround", 1.08, 0.105, mat.rubber, [0, -0.58, 0.42], [0, 0, 0]));
woofer.add(cyl("Woofer_black_paper_cone", 0.22, 0.93, 0.38, mat.cone, [0, -0.58, 0.38], [Math.PI / 2, 0, 0], 128, true));
woofer.add(cyl("Woofer_dust_cap", 0.31, 0.31, 0.08, mat.rubber, [0, -0.58, 0.58], [Math.PI / 2, 0, 0], 72));
woofer.add(torus("Woofer_subtle_cone_edge_seen_through_grille", 0.68, 0.012, mat.cone, [0, -0.58, 0.62], [0, 0, 0], 10, 96));
woofer.add(torus("Woofer_front_black_gasket_ring", 1.2, 0.042, mat.rubber, [0, -0.58, 0.51], [0, 0, 0]));
for (let i = 0; i < 8; i += 1) {
  const a = (Math.PI * 2 * i) / 8;
  woofer.add(cyl("Woofer_mount_screw", 0.035, 0.035, 0.03, mat.steel, [Math.sin(a) * 1.05, -0.58 + Math.cos(a) * 1.05, 0.46], [Math.PI / 2, 0, 0], 18));
}

const basket = makePart("Woofer_Cast_Basket", "Die cast / CNC aluminum", true, "Die-cast or machined woofer basket and mounting ring.", [0.95, -0.72, 1.15], []);
basket.add(torus("Basket_outer_ring", 1.16, 0.055, mat.metalcorexBlue, [0, -0.52, 0.08], [0, 0, 0]));
for (let i = 0; i < 8; i += 1) {
  const a = (Math.PI * 2 * i) / 8;
  const spoke = box("Basket_spoke", [0.08, 0.8, 0.07], mat.aluminum, [Math.sin(a) * 0.37, -0.52 + Math.cos(a) * 0.37, 0.08], [0, 0, -a]);
  basket.add(spoke);
}
basket.add(torus("Basket_inner_ring", 0.42, 0.045, mat.aluminum, [0, -0.52, 0.08], [0, 0, 0]));

makePart("Magnet_Motor", "Purchased driver assembly", false, "Woofer magnet and motor structure reference.", [0, -0.82, -1.2], [
  cyl("Magnet_stack", 0.46, 0.46, 0.38, mat.steel, [0, -0.52, -0.25], [Math.PI / 2, 0, 0], 72),
  cyl("Back_plate", 0.52, 0.52, 0.08, mat.aluminum, [0, -0.52, -0.49], [Math.PI / 2, 0, 0], 72)
]);

const horn = makePart("Injection_Molded_High_Frequency_Horn", "Injection molded plastic", true, "Injection molded high-frequency horn and waveguide.", [0, 1.48, 1.1], []);
horn.add(roundedBox("Horn_rounded_rect_outer_lip", [1.86, 0.86, 0.18], 0.075, mat.plastic, [0, 1.24, 0.54]));
horn.add(roundedBox("Horn_deep_rectangular_mouth_shadow", [1.45, 0.56, 0.06], 0.055, mat.shadow, [0, 1.24, 0.71]));
const realHornObj = loadObjAsMesh(
  "/Users/masonhuang/Downloads/8NCX750-8_P-Horn_V7R1-OBJ.obj",
  "Real_curved_horn_waveguide_reference",
  mat.horn,
  1.25,
  [0, 1.24, 0.45],
  [Math.PI / 2, 0, 0]
);
if (realHornObj) {
  realHornObj.scale.y *= 0.46;
  realHornObj.scale.z *= 0.38;
  horn.add(realHornObj);
} else {
  horn.add(box("Horn_upper_flare_wall", [1.22, 0.08, 0.5], mat.horn, [0, 1.51, 0.45], [0.22, 0, 0]));
  horn.add(box("Horn_lower_flare_wall", [1.22, 0.08, 0.5], mat.horn, [0, 0.97, 0.45], [-0.22, 0, 0]));
  horn.add(box("Horn_left_flare_wall", [0.08, 0.46, 0.5], mat.horn, [-0.71, 1.24, 0.45], [0, -0.2, 0]));
  horn.add(box("Horn_right_flare_wall", [0.08, 0.46, 0.5], mat.horn, [0.71, 1.24, 0.45], [0, 0.2, 0]));
}
horn.add(cyl("Horn_round_throat", 0.18, 0.18, 0.18, mat.horn, [0, 1.24, -0.08], [Math.PI / 2, 0, 0], 48));

makePart("Compression_Driver", "Purchased driver assembly", false, "Compression driver reference behind the horn.", [0.65, 1.45, -0.95], [
  cyl("Compression_driver_body", 0.34, 0.34, 0.4, mat.steel, [0, 1.18, -0.38], [Math.PI / 2, 0, 0], 64),
  cyl("Driver_exit", 0.16, 0.16, 0.15, mat.aluminum, [0, 1.18, -0.1], [Math.PI / 2, 0, 0], 48)
]);

const crossover = makePart("Crossover_Network", "Electrical assembly", false, "Crossover PCB reference with inductors and capacitors.", [-1.25, -1.6, -0.9], []);
crossover.add(box("Crossover_pcb", [0.92, 0.56, 0.045], mat.pcb, [-0.72, -1.67, -0.1]));
crossover.add(torus("Copper_inductor_1", 0.16, 0.025, mat.copper, [-0.94, -1.62, -0.04], [Math.PI / 2, 0, 0], 12, 32));
crossover.add(cyl("Capacitor_1", 0.06, 0.06, 0.22, mat.aluminum, [-0.52, -1.78, -0.02], [0, 0, 0], 32));
crossover.add(cyl("Capacitor_2", 0.05, 0.05, 0.2, mat.aluminum, [-0.34, -1.54, -0.02], [0, 0, 0], 32));

makePart("Sheet_Metal_Input_Plate", "Sheet metal interface plate", true, "Stamped sheet metal input plate with connector cutouts.", [1.48, -1.52, -0.72], [
  box("Input_plate", [0.82, 0.56, 0.055], mat.metalcorexBlue, [1.05, -1.67, -0.02]),
  cyl("Input_speakon_socket_1", 0.105, 0.105, 0.06, mat.cabinetEdge, [0.88, -1.67, 0.04], [Math.PI / 2, 0, 0], 36),
  cyl("Input_speakon_socket_2", 0.105, 0.105, 0.06, mat.cabinetEdge, [1.2, -1.67, 0.04], [Math.PI / 2, 0, 0], 36)
]);

makePart("Injection_Molded_Handle", "Injection molded plastic", true, "Recessed side carry handle, injection molded plastic.", [-1.22, 0.0, 0.68], [
  roundedBox("Handle_recess", [0.18, 0.92, 0.46], 0.075, mat.plastic, [-1.72, 0, -0.1]),
  torus("Handle_grip_opening", 0.29, 0.045, mat.plastic, [-1.77, 0, 0.06], [Math.PI / 2, 0, 0], 18, 64)
]);

makePart("Top_Recessed_Handle", "Injection molded plastic", true, "Top recessed handle commonly used on portable PA speaker cabinets.", [0, 2.0, 0.72], [
  box("Top_handle_recess_pan", [1.12, 0.2, 0.42], mat.plastic, [0, 2.23, -0.2]),
  torus("Top_handle_grip_slot", 0.34, 0.04, mat.plastic, [0, 2.25, -0.02], [Math.PI / 2, 0, Math.PI / 2], 18, 64)
]);

makePart("Injection_Molded_Corners", "Injection molded plastic", true, "Protective cabinet corners, injection molded plastic.", [0, 0, 0.82], [
  roundedCorner("Corner_TL", -1.48, 2.08),
  roundedCorner("Corner_TR", 1.48, 2.08),
  roundedCorner("Corner_BL", -1.48, -2.08),
  roundedCorner("Corner_BR", 1.48, -2.08)
]);

makePart("Injection_Molded_Pole_Cup", "Injection molded plastic", true, "Bottom pole mount cup for speaker stands.", [0, -2.12, -0.45], [
  cyl("Pole_cup_outer", 0.32, 0.32, 0.16, mat.plastic, [0, -2.22, -0.38], [0, 0, 0], 48),
  cyl("Pole_cup_inner_shadow", 0.21, 0.21, 0.17, mat.cabinetEdge, [0, -2.22, -0.32], [0, 0, 0], 48)
]);

makePart("Steel_Locking_Latch", "Speaker hardware", true, "Flush locking latch hardware for touring speaker cabinets and rigging covers.", [1.72, 0.58, 0.62], [
  box("Latch_recessed_mount_plate", [0.12, 0.78, 0.5], mat.metalcorexBlue, [1.64, 0.55, -0.12]),
  box("Latch_folded_hasps", [0.16, 0.38, 0.12], mat.steel, [1.56, 0.55, 0.08]),
  cyl("Latch_pivot_rivet_top", 0.04, 0.04, 0.035, mat.aluminum, [1.49, 0.78, 0.16], [0, Math.PI / 2, 0], 20),
  cyl("Latch_pivot_rivet_bottom", 0.04, 0.04, 0.035, mat.aluminum, [1.49, 0.32, 0.16], [0, Math.PI / 2, 0], 20)
]);

makePart("Speaker_Yoke_Bracket", "Sheet metal bracket", true, "Steel yoke or wall-mount bracket interface for installed professional speakers.", [-1.34, 1.06, 0.38], [
  box("Left_yoke_side_plate", [0.1, 0.92, 0.18], mat.metalcorexBlue, [-1.72, 1.05, 0.16]),
  box("Yoke_cross_bar", [0.14, 1.35, 0.14], mat.steel, [-1.72, 1.05, -0.32], [0, 0, Math.PI / 2]),
  cyl("Yoke_knob_bolt", 0.11, 0.11, 0.1, mat.plastic, [-1.82, 1.05, 0.22], [0, Math.PI / 2, 0], 32)
]);

makePart("Quick_Release_Pin", "Hardware kit", true, "Quick-release locking pin with pull ring for speaker bracket adjustment.", [1.82, 0.94, 0.95], [
  cyl("Blue_pull_pin_button", 0.07, 0.07, 0.18, mat.pinBlue, [1.58, 0.96, 0.34], [0, Math.PI / 2, 0], 32),
  cyl("Stainless_pin_shaft", 0.035, 0.035, 0.46, mat.aluminum, [1.36, 0.96, 0.34], [0, Math.PI / 2, 0], 24),
  torus("Split_pull_ring", 0.16, 0.014, mat.aluminum, [1.7, 0.96, 0.34], [0, Math.PI / 2, 0], 10, 48)
]);

makePart("Anti_Loss_Safety_Cable", "Wire rope tether", true, "Anti-loss stainless wire rope tether keeps pins and covers attached to the speaker cabinet.", [1.98, 0.72, 1.1], [
  cableCurve("Stainless_wire_rope_tether", [[1.58, 0.94, 0.26], [1.7, 0.72, 0.58], [1.54, 0.38, 0.48], [1.38, 0.28, 0.22]], mat.aluminum, 0.014),
  cyl("Cable_crimp_sleeve_a", 0.035, 0.035, 0.14, mat.aluminum, [1.58, 0.94, 0.26], [0.7, 0.4, 0], 18),
  cyl("Cable_crimp_sleeve_b", 0.035, 0.035, 0.14, mat.aluminum, [1.38, 0.28, 0.22], [0.8, -0.2, 0], 18)
]);

makePart("CNC_Adapter_Ring", "CNC aluminum", true, "CNC aluminum adapter ring for driver or horn mounting.", [1.42, 0.88, 0.98], [
  torus("CNC_adapter_ring", 0.52, 0.04, mat.aluminum, [0.98, 0.86, 0.12], [0, 0, 0], 18, 72),
  cyl("Adapter_counterbore_1", 0.045, 0.045, 0.025, mat.cabinetEdge, [0.98, 1.34, 0.16], [Math.PI / 2, 0, 0], 20),
  cyl("Adapter_counterbore_2", 0.045, 0.045, 0.025, mat.cabinetEdge, [0.98, 0.38, 0.16], [Math.PI / 2, 0, 0], 20)
]);

const screws = makePart("Screws_And_Fasteners", "Hardware kit", false, "Fasteners and assembly hardware reference.", [1.8, 1.9, 1.05], []);
for (let i = 0; i < 10; i += 1) {
  const x = 1.0 + (i % 5) * 0.16;
  const y = 1.75 + Math.floor(i / 5) * 0.18;
  screws.add(cyl("M5_socket_screw", 0.04, 0.04, 0.09, mat.steel, [x, y, 0.22], [Math.PI / 2, 0, 0], 20));
}

scene.traverse((object) => {
  if (object.isMesh) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
});

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(scene, {
  binary: true,
  trs: false,
  onlyVisible: true,
  includeCustomExtensions: false
});

fs.writeFileSync(path.join(outDir, "metalcorex-pa-speaker-exploded.glb"), Buffer.from(result));

let meshCount = 0;
let triangleCount = 0;
const objects = [];
scene.traverse((object) => {
  if (object.isMesh) {
    meshCount += 1;
    const geometry = object.geometry;
    triangleCount += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
  }
  if (object.parent === scene && object.type === "Group") {
    objects.push({
      name: object.name,
      category: object.userData.category,
      metalcorexManufacturable: object.userData.metalcorexManufacturable,
      explode: object.userData.explode,
      description: object.userData.description,
      childCount: object.children.length
    });
  }
});

const manifest = {
  file: "website/assets/models/metalcorex-pa-speaker-exploded.glb",
  generatedAt: new Date().toISOString(),
  license: "CC0-1.0; self-built by Metalcorex/Codex for Metalcorex website use",
  meshCount,
  triangleCount: Math.round(triangleCount),
  objects
};

fs.writeFileSync(path.join(sourceDir, "metalcorex-pa-speaker-model-manifest.json"), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));
