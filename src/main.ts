import {vec3, vec2, vec4, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Mesh from './geometry/Mesh';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import Light from './LIght';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Texture from './rendering/gl/Texture';

// Define an object with application parameters and button callbacks
// const controls = {
//   // Extra credit: Add interactivity
// };

let square: Square;

// TODO: replace with your scene's stuff

let obj0: string;
let mesh0: Mesh;
let obj1: string;
let plane: Mesh;

let tex0: Texture;


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
  obj0 = readTextFile('../resources/obj/alpaca.obj')
  obj1 = readTextFile('../resources/obj/plane.obj')
}


function loadScene() {
  square && square.destroy();
  mesh0 && mesh0.destroy();
  plane && plane.destroy();

  plane = new Mesh(obj1, vec3.fromValues(0, 0, 0));
  plane.create();

  mesh0 = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  mesh0.create();

  tex0 = new Texture('../resources/textures/alpaca.jpg')
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

  const camera = new Camera(vec3.fromValues(0, 9, 25), vec3.fromValues(0, 9, 0));
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

  standardDeferred.setupTexUnits(["tex_Color"]);
  //shadowDeferred.setupTexUnits(["tex_Color"]);
  
  // camera view to light view matrix: light view * inverse(camera view)
  let shadowMat = mat4.create(); 
  let invViewProj = mat4.create();
  mat4.copy(invViewProj, camera.viewMatrix);
  mat4.invert(invViewProj, invViewProj);
  mat4.multiply(shadowMat, light.viewMatrix, invViewProj);

  renderer.setLightMatrices(shadowMat, light.projectionMatrix, light.viewMatrix);

  standardDeferred.setProjMatrix(camera.projectionMatrix);

  function tick() {
    camera.update();

    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    timer.updateTime();
    renderer.updateTime(timer.deltaTime, timer.currentTime);

    renderer.setDimensions(vec2.fromValues(window.innerWidth, window.innerHeight));

    standardDeferred.bindTexToUnit("tex_Color", tex0, 0);
    //shadowDeferred.bindTexToUnit("tex_Color", tex0, 0); 

    renderer.clear();
    renderer.clearGB();

    // TODO: pass any arguments you may need for shader passes
    // forward render mesh info into gbuffers
    renderer.renderToGBuffer(camera, light, standardDeferred, shadowDeferred, [mesh0, plane]);
    // render from gbuffers into 32-bit color buffer
    renderer.renderFromGBuffer(camera, light);
    // apply 32-bit post and tonemap from 32-bit color to 8-bit color
    renderer.renderPostProcessHDR();
    // apply 8-bit post and draw
    renderer.renderPostProcessLDR();

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
