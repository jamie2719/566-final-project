
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

import LSystem from './LSystem/LSystem';
import TurtleParser from './LSystem/TurtleParser';
import Turtle from './LSystem/Turtle';
import CharNode from './LSystem/CharNode';

import Cloud from './geometry/Cloud'

const controls = {
  Iterations: 2,
  Axiom: "F",
  Reload: function() {loadScene()}
};

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
let treeTex: Texture;
let leafTex: Texture;

let treeMesh1 : Mesh;
let treeMesh2 : Mesh;
let treeMesh3 : Mesh;
let treeMesh4 : Mesh;
let branchS: string;
let trunkS: string;
let leafS: string;
let lsystem: LSystem;
let turtleParser: TurtleParser;
//original obj data for branches
let indicesB: Uint32Array; 
let positionsB: Float32Array;
let normalsB: Float32Array;


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

function random2(p: vec2 ) : vec2 {
  var result = vec2.create();
  var v1 = 43758.5453 * Math.sin(vec2.dot(p, vec2.fromValues(127.1,311.7))) - 1.0;
  var v2 = 43758.5453 * Math.sin(vec2.dot(p,vec2.fromValues(269.5,183.3))) - 1.0;
  result = vec2.fromValues(v1, v2);
  return vec2.normalize(result, result);
}

function loadTrees(treeMesh: Mesh) {
  lsystem = new LSystem(controls.Axiom, controls.Iterations);
  lsystem.doIterations();
  //console.log(lsystem.seed);

  //load in default branch vertex data
  var branchDef = new Mesh(branchS, vec3.fromValues(0, 0, 0), .5);
  var leafDef = new Mesh(leafS, vec3.fromValues(0, 0, 0), .6);
 
  //create first turtle
  var currTurtle = new Turtle(vec3.fromValues(treeMesh.center[0], treeMesh.center[1], treeMesh.center[2]), vec3.fromValues(0, 1, 0), mat4.create());
  //create turtle stack
  turtleParser = new TurtleParser(currTurtle);

  
  //set turtle stack's default branch to the branch you created
  turtleParser.defaultBranch = branchDef;
  //console.log(branchDef);
  turtleParser.defaultLeaf = leafDef;
  treeMesh = turtleParser.renderSymbols(CharNode.stringToLinkedList(lsystem.seed), treeMesh);
  treeMesh.create();
}

function loadOBJText() {
 
  alpacaS = readTextFile('./src/resources/obj/alpaca.obj');
  groundS = readTextFile('./src/resources/obj/ground.obj');

  branchS = readTextFile('./src/resources/obj/branch1OBJ.obj');
  leafS = readTextFile('./src/resources/obj/leaf.obj');

  frameS = readTextFile('./src/resources/obj/frame.obj');
  
  wallS = readTextFile('./src/resources/obj/wall.obj');
  cloudS = readTextFile('./src/resources/obj/cloud.obj');
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

  alpaca = new Mesh(alpacaS, vec3.fromValues(0, 0, 0), .1);
  alpaca.create();

  frame = new Mesh(frameS, vec3.fromValues(0, 0, 0), .2);
  frame.create();

  wall = new Mesh(wallS, vec3.fromValues(0, 0, 0), .3);
  wall.create();

  cloud = new Mesh(cloudS, vec3.fromValues(0, 0, 0), .4);
  cloud.create();

  
  clouds = new Cloud();
  clouds.setData();


  let offsets: Float32Array = new Float32Array(clouds.getOffsets());
  let colors: Float32Array = new Float32Array(clouds.getColors());
  cloud.setInstanceVBOs(offsets, colors);
  let n = clouds.getNumParticles();
  cloud.setNumInstances(n * n);


  alpacaTex = new Texture('./resources/textures/alpaca.jpg');
  frameTex = new Texture('./src/resources/textures/wood.jpg');
  wallTex = new Texture('./src/resources/textures/paint.jpg');
  treeTex = new Texture('./src/resources/textures/tree.jpg');
  leafTex = new Texture('./src/resources/textures/leaf.jpg');

  //generate random tree positions
  var posX1 = (Math.random() * 2.0 - 1.0) * 600.0;
  var posZ1 = (Math.random() * 2.0 - 1.0);
  if(posZ1 < 0) {
    posZ1 *= 370.0;
  } 
  else {
    posZ1 *= -370.0;
  }
  var posX2 = (Math.random() * 2.0 - 1.0) * 600.0;
  var posZ2 = (Math.random() * 2.0 - 1.0);
  if(posZ2 < 0) {
    posZ2 *= 370.0;
  } 
  else {
    posZ2 *= -370.0;
  }
  var posX3 = (Math.random() * 2.0 - 1.0) * 600.0;
  var posZ3 = (Math.random() * 2.0 - 1.0);
  if(posZ3 < 0) {
    posZ3 *= 370.0;
  } 
  else {
    posZ3 *= -370.0;
  }
  treeMesh1 = new Mesh(branchS, vec3.fromValues(0, 0, 0), .5);
  loadTrees(treeMesh1);
  treeMesh2 = new Mesh(branchS, vec3.fromValues(posX1, 0, posZ1), .5);
  loadTrees(treeMesh2);
  treeMesh3 = new Mesh(branchS, vec3.fromValues(posX2, 0, posZ2), .5);
  loadTrees(treeMesh3);
  treeMesh4 = new Mesh(branchS, vec3.fromValues(posX3, 0, posZ3), .5);
  loadTrees(treeMesh4);
  

  

}


function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  const gui = new DAT.GUI();
  gui.add(controls, 'Iterations', 0, 4).step(1);
  gui.add(controls, 'Axiom');
  gui.add(controls, 'Reload');

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
  
  clouds.update(timer.currentTime);
  clouds.setData();
  let offsets: Float32Array = new Float32Array(clouds.getOffsets());
  let colors: Float32Array = new Float32Array(clouds.getColors());
  cloud.setInstanceVBOs(offsets, colors);
  let n = clouds.getNumParticles();
  cloud.setNumInstances(n * n);

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

      const cloudDeferred = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/cloud-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/cloud-frag.glsl')),
        ]);


  standardDeferred.setupTexUnits(["tex_Color0"]);
  standardDeferred.setupTexUnits(["tex_Color1"]);
  standardDeferred.setupTexUnits(["tex_Color2"]);
  standardDeferred.setupTexUnits(["tex_Color3"]);
  standardDeferred.setupTexUnits(["tex_Color4"]);

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


    clouds.update(timer.currentTime);
    clouds.setData();
    let offsets: Float32Array = new Float32Array(clouds.getOffsets());
    let colors: Float32Array = new Float32Array(clouds.getColors());
    cloud.setInstanceVBOs(offsets, colors);
    let n = clouds.getNumParticles();
    cloud.setNumInstances(n * n);

    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    timer.updateTime();
    renderer.updateTime(timer.deltaTime, timer.currentTime);

    renderer.setDimensions(vec2.fromValues(window.innerWidth, window.innerHeight));

    standardDeferred.bindTexToUnit("tex_Color0", alpacaTex, 0);
    standardDeferred.bindTexToUnit("tex_Color1", frameTex, 1);
    standardDeferred.bindTexToUnit("tex_Color2", wallTex, 2);
    standardDeferred.bindTexToUnit("tex_Color3", treeTex, 3);
    standardDeferred.bindTexToUnit("tex_Color4", leafTex, 4);


    renderer.clear();
    renderer.clearGB();

    // TODO: pass any arguments you may need for shader passes
    // forward render mesh info into gbuffers


    renderer.renderToGBuffer(camera, light, standardDeferred, shadowDeferred, [alpaca, ground, frame, 
                            treeMesh1, treeMesh2, treeMesh3, treeMesh4, wall, cloud]);
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
