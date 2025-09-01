import * as THREE from 'https://unpkg.com/three@0.163.0/build/three.module.js';
import { VRButton } from 'https://unpkg.com/three@0.163.0/examples/jsm/webxr/VRButton.js';
import { ARButton } from 'https://unpkg.com/three@0.163.0/examples/jsm/webxr/ARButton.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Try VR or AR button
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

// Animation loop
renderer.setAnimationLoop(() => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
});

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
