import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';
import { VRButton } from 'https://unpkg.com/three@0.163.0/examples/jsm/webxr/VRButton.js';
import { ARButton } from 'https://unpkg.com/three@0.163.0/examples/jsm/webxr/ARButton.js';

// === Scene setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// Camera slightly above floor, looking at the rug
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.5, 3);
camera.lookAt(0, 0, 0);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// === WebXR support (VR first, then AR, else fallback) ===
if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-vr').then((vrSupported) => {
    if (vrSupported) {
      document.body.appendChild(VRButton.createButton(renderer));
    } else {
      navigator.xr.isSessionSupported('immersive-ar').then((arSupported) => {
        if (arSupported) {
          document.body.appendChild(ARButton.createButton(renderer));
        } else {
          console.log('WebXR not supported, showing normal 3D scene only.');
        }
      });
    }
  });
} else {
  console.log('navigator.xr not available, showing normal 3D scene only.');
}

// === Lighting ===
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(2, 4, 2);
scene.add(dirLight);

// === Floor ===
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x333333,
  roughness: 1
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// === Rug (textured plane) ===
const textureLoader = new THREE.TextureLoader();

const rugTexture = textureLoader.load('textures/rug-1.jpg');

const rugWidth = 2.0;
const rugHeight = 3.0;
const rugGeometry = new THREE.PlaneGeometry(rugWidth, rugHeight);
const rugMaterial = new THREE.MeshStandardMaterial({
  map: rugTexture,
  side: THREE.DoubleSide,
  emissive: 0x000000,
  emissiveIntensity: 1
});
const rug = new THREE.Mesh(rugGeometry, rugMaterial);

// Lay the rug on the floor
rug.rotation.x = -Math.PI / 2;
rug.position.y = 0.01;
scene.add(rug);

// === Interaction mode toggle ===
let interactive = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// === Hover circle cursor on the rug ===
const cursorGeometry = new THREE.CircleGeometry(0.25, 32);
const cursorMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.8
});
const hoverCursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
// Align with rug (flat on floor)
hoverCursor.rotation.x = -Math.PI / 2;
hoverCursor.visible = false;
scene.add(hoverCursor);

// Mouse move: highlight rug + show cursor when hovering
window.addEventListener('mousemove', (event) => {
  if (!interactive) return;

  // Normalised device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(rug);

  if (intersects.length > 0) {
    const point = intersects[0].point;

    // Position the cursor slightly above rug so it doesn't clip
    hoverCursor.position.set(point.x, point.y + 0.01, point.z);
    hoverCursor.visible = true;

    // Highlight rug
    rug.material.emissive.set(0x222222);
  } else {
    // Not hovering over rug
    hoverCursor.visible = false;
    rug.material.emissive.set(0x000000);
  }
});

// Buttons
document.getElementById('viewBtn').addEventListener('click', () => {
  interactive = false;
  hoverCursor.visible = false;
  rug.material.emissive.set(0x000000);
});

document.getElementById('interactBtn').addEventListener('click', () => {
  interactive = true;
  // We only show the cursor when actually hovering, handled in mousemove
});

// === Animation loop ===
renderer.setAnimationLoop(() => {
  // In view mode, gently rotate the rug for inspection
  if (!interactive) {
    rug.rotation.z += 0.003;
  }

  renderer.render(scene, camera);
});

// === Resize handling ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
