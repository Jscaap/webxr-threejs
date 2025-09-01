import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';
import { VRButton } from 'https://unpkg.com/three@0.163.0/examples/jsm/webxr/VRButton.js';
import { ARButton } from 'https://unpkg.com/three@0.163.0/examples/jsm/webxr/ARButton.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// VR/AR support
if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
    if (supported) {
      document.body.appendChild(VRButton.createButton(renderer));
    } else {
      navigator.xr.isSessionSupported('immersive-ar').then((arSupported) => {
        if (arSupported) {
          document.body.appendChild(ARButton.createButton(renderer));
        } else {
          console.log("WebXR not supported, showing normal 3D scene only.");
        }
      });
    }
  });
}

// Lighting
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(light);

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// --- Interaction Mode Toggle ---
let interactive = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Red laser line (hidden at first)
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -5)
]);
const laser = new THREE.Line(lineGeometry, lineMaterial);
laser.visible = false;
scene.add(laser);

// Mouse move updates the laser
window.addEventListener('mousemove', (event) => {
  if (!interactive) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const dir = raycaster.ray.direction.clone().normalize().multiplyScalar(5);
  laser.geometry.setFromPoints([new THREE.Vector3(0, 0, 0), dir]);
});

// Mouse click selects the cube
window.addEventListener('click', () => {
  if (!interactive) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);

  if (intersects.length > 0) {
    cube.material.color.set(0xff0000); // turn red on click
  }
});

// Buttons
document.getElementById('viewBtn').addEventListener('click', () => {
  interactive = false;
  laser.visible = false; // hide laser
  cube.material.color.set(0x00ffcc); // reset cube color
});

document.getElementById('interactBtn').addEventListener('click', () => {
  interactive = true;
  laser.visible = true; // show laser
});

// Animation loop
renderer.setAnimationLoop(() => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

