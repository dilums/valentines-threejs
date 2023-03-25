import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'



let camera, scene, renderer, particleSets;
const textureLoader = new THREE.TextureLoader();
const colorSets = [
  [0xc60507, 5],
  [0x9c1c33, 8],
  [0x7d0633, 10],
  [0xe11d74, 15],
  [0xc70039, 12]
];

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x321f28);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  const { innerWidth: w } = window;
  console.log(w);
  camera.position.set(0, 0, clamp(map(w, 375, 2560, 543, 300), 300, 543));
  camera.rotation.x = -6.123233995736766e-17;
  camera.rotation.y = 0;
  camera.rotation.z = 0;

  const controls = new OrbitControls(camera, renderer.domElement);

  addAmbientLight(scene);
  addDirectionalLight(scene);
  addResizeHandler(renderer, camera);
  addObjects(scene);
  render();
}

function render(t) {
  update(t);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function addObjects(scene) {
  loadModel(scene);

  particleSets = colorSets.map(([color, size]) =>
    addParticles(scene, 200, color, size)
  );

  particleSets.forEach((item) => {
    item.rotation.x = Math.random() * 6;
    item.rotation.y = Math.random() * 6;
    item.rotation.z = Math.random() * 6;
  });
}

function update(t) {
  particleSets.forEach((item, i) => {
    item.rotation.y = t * (i + 1) * 0.00005 * (i % 2 === 0 ? -1 : 1);
  });
}

function loadModel(scene) {
  const loader = new GLTFLoader();
  loader.load(
    "/valentines-text.glb",
    (gltf) => {
      scene.add(gltf.scene);
    }
  );
}

// https://karthikkaranth.me/blog/generating-random-points-in-a-sphere/
function getPoint() {
  var u = Math.random();
  var v = Math.random();
  var theta = u * 2.0 * Math.PI;
  var phi = Math.acos(2.0 * v - 1.0);
  var r = Math.cbrt(Math.random());
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);
  var sinPhi = Math.sin(phi);
  var cosPhi = Math.cos(phi);
  var x = r * sinPhi * cosTheta;
  var y = r * sinPhi * sinTheta;
  var z = r * cosPhi;
  return { x: x, y: y, z: z };
}

function addParticles(scene, amount, color, size) {
  const vertices = [];
  const geometry = new THREE.BufferGeometry();
  const sprite = textureLoader.load(
    "/valentines-heart.png"
  );

  range(amount).forEach(() => {
    const { x, y, z } = getPoint();

    vertices.push(x * 300, y * 300, z * 300);
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const material = new THREE.PointsMaterial({
    size,
    map: sprite,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });
  material.color.set(color);

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  return particles;
}

function addResizeHandler(renderer, camera) {
  window.addEventListener(
    "resize",
    () => {
      const { innerWidth: w, innerHeight: h } = window;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    false
  );
}

function addDirectionalLight(scene) {
  const color = 0xffffff;
  const intensity = 0.6;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}

function addAmbientLight(scene) {
  const color = 0xffffff;
  const intensity = 0.6;
  const light = new THREE.AmbientLight(color, intensity);
  scene.add(light);
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}
function map(value, sMin, sMax, dMin, dMax) {
  return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin);
}
function range(n, m = 0) {
  return Array(n)
    .fill(m)
    .map((i, j) => i + j);
}
init();
