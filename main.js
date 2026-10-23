// Sets up the Three.js scene and draws the jitterbug as struts, joints and faces.
// The positions come from jitterbug.js; this file only turns them into 3D objects.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getVertices, FACES, EDGES } from './jitterbug.js';
import { initUI } from './ui.js';

const STRUT_RADIUS = 0.025;
const JOINT_RADIUS = 0.045;
const FOV = 40; // camera's vertical field of view, in degrees

const container = document.getElementById('viewer');

// --- Renderer, scene, camera ---------------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap for phone battery
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1220);

const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
camera.position.set(2.2, 1.6, 3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // a little momentum after you let go
controls.enablePan = false;
controls.minDistance = 1.5;
controls.maxDistance = 8;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(3, 5, 4);
scene.add(keyLight);

// --- The model -------------------------------------------------------------

const strutMaterial = new THREE.MeshStandardMaterial({ color: 0xf5c04a, metalness: 0.3, roughness: 0.4 });
const jointMaterial = new THREE.MeshStandardMaterial({ color: 0xf4f4f8, metalness: 0.1, roughness: 0.3 });
const faceMaterial = new THREE.MeshStandardMaterial({
  color: 0x4fc3f7,
  transparent: true,
  opacity: 0.25,
  side: THREE.DoubleSide,
  depthWrite: false, // lets you see struts through the tinted faces
});

// A cylinder 1 unit tall along Y; each strut is stretched and rotated to fit.
const strutGeometry = new THREE.CylinderGeometry(STRUT_RADIUS, STRUT_RADIUS, 1, 12);
const jointGeometry = new THREE.SphereGeometry(JOINT_RADIUS, 16, 12);

function addMesh(geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

const struts = EDGES.map(() => addMesh(strutGeometry, strutMaterial));
const joints = getVertices(0).map(() => addMesh(jointGeometry, jointMaterial));

// All 8 faces share one geometry; we rewrite its corner positions each update.
const facePositions = new Float32Array(FACES.length * 9);
const faceGeometry = new THREE.BufferGeometry();
faceGeometry.setAttribute('position', new THREE.BufferAttribute(facePositions, 3));
scene.add(new THREE.Mesh(faceGeometry, faceMaterial));

const up = new THREE.Vector3(0, 1, 0);
const a = new THREE.Vector3();
const b = new THREE.Vector3();

function updateModel(t) {
  const vertices = getVertices(t);

  joints.forEach((joint, i) => joint.position.fromArray(vertices[i]));

  EDGES.forEach(([i, j], k) => {
    a.fromArray(vertices[i]);
    b.fromArray(vertices[j]);
    const strut = struts[k];
    strut.position.addVectors(a, b).multiplyScalar(0.5); // midpoint
    b.sub(a); // direction from a to b
    strut.scale.set(1, b.length(), 1);
    strut.quaternion.setFromUnitVectors(up, b.normalize());
  });

  FACES.forEach((face, f) => {
    face.forEach((v, c) => facePositions.set(vertices[v], f * 9 + c * 3));
  });
  faceGeometry.attributes.position.needsUpdate = true;
  faceGeometry.computeVertexNormals();
}

// --- Sizing and render loop ------------------------------------------------

function resize() {
  const { clientWidth: w, clientHeight: h } = container;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Field of view is vertical, so on tall (portrait) screens the sides get
  // cropped. Widen it there so the horizontal view stays the same.
  camera.fov = camera.aspect >= 1
    ? FOV
    : THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(FOV / 2)) / camera.aspect));
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(container);
resize();

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});

initUI({ onChange: updateModel });
