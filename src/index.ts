import {
  Mesh,
  AxesHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  DirectionalLight,
  AmbientLight,
  PlaneBufferGeometry,
  MeshStandardMaterial,
  Vector3,
  AnimationMixer,
  Clock
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GUI } from 'dat.gui';
import gsap from 'gsap';
import './main.css';

const gui = new GUI();

const scene = new Scene();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Path to the WASM draco folder container the WASM code 
// The trailing slash in the path in important

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

// Animation Mixer used to play animations
let mixer = null;

loader.load(
  '/models/Fox/glTF/Fox.gltf',
  (glTF) => {
    console.log('glTF loading finished');

    glTF.scene.scale.set(0.025, 0.025, 0.025);
    scene.add(glTF.scene) // this will load the entire scene into our scene, including things that we don't need

    mixer = new AnimationMixer(glTF.scene);
    const action = mixer.clipAction(glTF.animations[0]);
    action.play();

    // scene.add(glTF.scene.children[0]); // this will only load the first child
    
    // This code will lead to error
    // glTF.scene.children.map((object) => {
      // scene.add(object);
    // })

    // while(glTF.scene.children.length > 0){
    //   scene.add(glTF.scene.children[0]);
    // }
  },
  () => {
    console.log('glTF loading in progress');
  },
  () => {
    console.log('glTF loading failed');
  }
);

const directionalLight = new DirectionalLight('white', 0.5);
scene.add(directionalLight);

const ambientLight = new AmbientLight('white', 0.3);
scene.add(ambientLight);

const canvas = document.createElement('canvas');
canvas.setAttribute('id', 'three-js-stage');
document.body.appendChild(canvas);

const dimension = {
  height: window.innerHeight,
  width: window.innerWidth
};

const planeMesh = new Mesh(
  new PlaneBufferGeometry(6, 6),
  new MeshStandardMaterial({
    color: 0xffffff
  })
);
planeMesh.position.set(0, -1, 0);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);

const camera = new PerspectiveCamera(75, dimension.width / dimension.height);
camera.position.set(3, 3, 3);
scene.add(camera);

const axesHelper = new AxesHelper(1000);
scene.add(axesHelper);

const renderer = new WebGLRenderer({
  canvas
});
renderer.setSize(dimension.width, dimension.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const control = new OrbitControls(camera, canvas);
control.target = new Vector3();

window.addEventListener('resize', function () {
  dimension.height = window.innerHeight;
  dimension.width = window.innerWidth;

  camera.aspect = dimension.width / dimension.height;
  camera.updateProjectionMatrix();

  renderer.setSize(dimension.width, dimension.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const directionalLightFolder = gui.addFolder('Directional Light');
directionalLightFolder.add(directionalLight, 'intensity').max(1).min(0).step(0.01);
directionalLightFolder.add(directionalLight.position, 'x').max(100).min(2).step(1);
directionalLightFolder.add(directionalLight.position, 'y').max(100).min(2).step(1);
directionalLightFolder.add(directionalLight.position, 'z').max(100).min(2).step(1);

const ambientLightFolder = gui.addFolder('Ambient Light');
ambientLightFolder.add(ambientLight, 'intensity').max(1).min(0).step(0.01);

// const cubeFolder = gui.addFolder('Red Cube');
// cubeFolder.add(mesh.position, 'x').name('position-x').min(-10).max(10).step(0.001);
// cubeFolder.add(mesh.position, 'y').name('position-y').min(-10).max(10).step(0.001);
// cubeFolder.add(mesh.position, 'z').name('position-z').min(-10).max(10).step(0.001);
// cubeFolder
// .add(mesh.rotation, 'x')
// .name('rotation-x')
// .min(-2 * Math.PI)
// .max(2 * Math.PI)
// .step(0.001);
// cubeFolder
// .add(mesh.rotation, 'y')
// .name('rotation-y')
// .min(-2 * Math.PI)
// .max(2 * Math.PI)
// .step(0.001);
// cubeFolder
// .add(mesh.rotation, 'z')
// .name('rotation-z')
// .min(-2 * Math.PI)
// .max(2 * Math.PI)
// .step(0.001);

const clock = new Clock();
let lastTimestamp = clock.getElapsedTime();
let rafId: number;

function gameLoop() {
  const currentTimestamp = clock.getElapsedTime();
  const deltaTime = currentTimestamp - lastTimestamp;
  lastTimestamp = currentTimestamp;

  if(mixer) mixer.update(deltaTime);

  control.update();
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(gameLoop);
}

gameLoop();