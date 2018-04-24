
import {vec3, vec2, vec4, mat4} from 'gl-matrix';


import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
// import Square from './geometry/Square';
import Cube from './geometry/Cube';
import Mesh from './geometry/Mesh';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import Light from './Light';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Texture from './rendering/gl/Texture';
import Cloud from './geometry/Cloud'

// Define an object with application parameters and button callbacks
// const controls = {
//   // Extra credit: Add interactivity
// };

//let groundPlane: Cube;

// TODO: replace with your scene's stuff

let alpacaS: string;
let alpaca: Mesh;

let cloudS: string;
let cloud: Mesh;

let clouds: Cloud;

let frameS: string;
let frame: Mesh;

let wallS: string;
let wall: Mesh;

let wahooS: string;
let wahoo: Mesh;

let groundS: string;
let ground: Mesh;

let alpacaTex: Texture;
let frameTex: Texture;
let wallTex: Texture;


var timer = {
  deltaTime: 0.0,
  startTime: 0.0,
  currentTime: 0.0,
  updateTime: function() {
    var t = Date.now();
    t = (t - timer.startTime) * 0.001;
    timer.deltaTime = t - timer.currentTime;
    timer.currentTime = t;
  },
}


function loadOBJText() {
  frameS = readTextFile('../resources/obj/frame.obj')
  alpacaS = readTextFile('../resources/obj/alpaca.obj')
  groundS = readTextFile('../resources/obj/ground.obj')
  wallS = readTextFile('../resources/obj/wall.obj')
  cloudS = readTextFile('../resources/obj/cloud.obj')
}

function VBOtoVec4(arr: Float32Array) {
  var vectors: Array<vec4> = new Array<vec4>();
  for(var i = 0; i < arr.length; i+=4) {
    var currVec = vec4.fromValues(arr[i], arr[i+1], arr[i+2], arr[i+3]);
    vectors.push(currVec);
  }
  return vectors;
}

function transformVectors(vectors: Array<vec4>, transform: mat4) {
  for(var i = 0; i < vectors.length; i++) {
      var newVector: vec4 = vec4.create();
      newVector = vec4.transformMat4(newVector, vectors[i], transform);

      vectors[i] = newVector;
  }
  return vectors;
}

// Just converts from vec4 to floats for VBOs
function Vec4toVBO(vectors: Array<vec4>) {
  var j: number = 0;
  var arr = new Float32Array(vectors.length*4);
  for(var i = 0; i < vectors.length; i++) {
      var currVec = vectors[i];
      arr[j] = currVec[0];
      arr[j+1] = currVec[1];
      arr[j+2] = currVec[2];
      arr[j+3] = currVec[3];
      j+=4;
  }
  return arr;
}




function loadScene() {
  ground && ground.destroy();
  alpaca && alpaca.destroy();
  frame && frame.destroy();
  wall && wall.destroy();
  cloud && cloud.destroy();

  //setup ground plane
  ground = new Mesh(groundS, vec3.fromValues(0, 0, 0), 0);
  ground.create();

  alpaca = new Mesh(alpacaS, vec3.fromValues(0, 0, 0), 1);
  alpaca.create();

  frame = new Mesh(frameS, vec3.fromValues(0, 0, 0), 2);
  frame.create();

  wall = new Mesh(wallS, vec3.fromValues(0, 0, 0), 3);
  wall.create();

  cloud = new Mesh(cloudS, vec3.fromValues(0, 0, 0), 4);
  cloud.create();

  
  clouds = new Cloud();
  clouds.setData();


  let offsets: Float32Array = new Float32Array(clouds.getOffsets());
  let colors: Float32Array = new Float32Array(clouds.getColors());
  cloud.setInstanceVBOs(offsets, colors);
  let n = clouds.getNumParticles();
  cloud.setNumInstances(n * n);


  alpacaTex = new Texture('../resources/textures/alpaca.jpg');
  frameTex = new Texture('../resources/textures/wood.jpg');
  wallTex = new Texture('../resources/textures/paint.jpg');


}


function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  // const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 50, 300), vec3.fromValues(0, 50, 0));
  const light = new Light(vec3.fromValues(5, 10, 5), vec3.create());
  light.update();
  light.updateProjectionMatrix();


  const renderer = new OpenGLRenderer(canvas, vec4.fromValues(light.position[0], light.position[1], light.position[2], 1));
  renderer.setClearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  const standardDeferred = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/standard-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/standard-frag.glsl')),
    ]);


    const shadowDeferred = new ShaderProgram([
      new Shader(gl.VERTEX_SHADER, require('./shaders/shadow-vert.glsl')),
      new Shader(gl.FRAGMENT_SHADER, require('./shaders/shadow-frag.glsl')),
      ]);


  standardDeferred.setupTexUnits(["tex_Color0"]);
  standardDeferred.setupTexUnits(["tex_Color1"]);
  standardDeferred.setupTexUnits(["tex_Color2"]);

  let shadowMat = mat4.create(); 
  let invViewProj = mat4.create();
  mat4.copy(invViewProj, camera.viewMatrix);
  mat4.invert(invViewProj, invViewProj);
  mat4.multiply(shadowMat, light.viewMatrix, invViewProj);

  gl.enable(gl.BLEND);
  renderer.setLightMatrices(shadowMat, light.projectionMatrix, light.viewMatrix);
  standardDeferred.setProjMatrix(camera.projectionMatrix);

  function tick() {
    camera.update();

    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    timer.updateTime();
    renderer.updateTime(timer.deltaTime, timer.currentTime);

    renderer.setDimensions(vec2.fromValues(window.innerWidth, window.innerHeight));

    standardDeferred.bindTexToUnit("tex_Color0", alpacaTex, 0);
    standardDeferred.bindTexToUnit("tex_Color1", frameTex, 1);
    standardDeferred.bindTexToUnit("tex_Color2", wallTex, 2);


    renderer.clear();
    renderer.clearGB();

    // TODO: pass any arguments you may need for shader passes
    // forward render mesh info into gbuffers

    renderer.renderToGBuffer(camera, light, standardDeferred, shadowDeferred, [alpaca, ground, frame, wall, cloud]);
    // render from gbuffers into 32-bit color buffer
    renderer.renderFromGBuffer(camera, light);
    // apply 32-bit post and tonemap from 32-bit color to 8-bit color
    renderer.renderPostProcessHDR();
    // apply 8-bit post and draw
    renderer.renderPostProcessLDR(camera);

    stats.end();
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}


function setup() {
  timer.startTime = Date.now();
  loadOBJText();
  main();
}

setup();
