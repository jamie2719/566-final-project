import {vec3, vec4, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Mesh from './geometry/Mesh';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Texture from './rendering/gl/Texture';

// Define an object with application parameters and button callbacks
// const controls = {
//   // Extra credit: Add interactivity
// };

let groundPlane: Square;

// TODO: replace with your scene's stuff

let obj0: string;
let mesh0: Mesh;

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
  obj0 = readTextFile('../resources/obj/wahoo.obj')
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
  groundPlane && groundPlane.destroy();
  mesh0 && mesh0.destroy();

  //setup ground plane
  groundPlane = new Square(vec3.fromValues(0, 0, 0));
  var posVectors = VBOtoVec4(groundPlane.positions);
  var norVectors = VBOtoVec4(groundPlane.normals);
  var groundRot = mat4.create();
  var invRot = mat4.create();
  groundRot = mat4.rotateX(groundRot, groundRot, Math.PI * 90 / 180);
  invRot = mat4.transpose(invRot, groundRot);
  var groundScale = mat4.create();
  groundScale = mat4.scale(groundScale, groundScale, vec3.fromValues(10, 10, 10));
  transformVectors(posVectors, groundRot);
  transformVectors(norVectors,invRot);
  transformVectors(posVectors, groundScale);
  groundPlane.positions = Vec4toVBO(posVectors);
  groundPlane.normals = Vec4toVBO(norVectors);
  groundPlane.create();


  mesh0 = new Mesh(obj0, vec3.fromValues(0, 0, 0));
  mesh0.create();

   tex0 = new Texture('../resources/textures/wahoo.bmp')
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

  const camera = new Camera(vec3.fromValues(0, 4, 25), vec3.fromValues(0, 4, 0)); //pos, target

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  const standardDeferred = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/standard-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/standard-frag.glsl')),
    ]);

  standardDeferred.setupTexUnits(["tex_Color"]);

  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    timer.updateTime();
    renderer.updateTime(timer.deltaTime, timer.currentTime);

    standardDeferred.bindTexToUnit("tex_Color", tex0, 0);

    renderer.clear();
    renderer.clearGB();

    // TODO: pass any arguments you may need for shader passes
    // forward render mesh info into gbuffers
   // renderer.renderToGBuffer(camera, standardDeferred, [mesh0]);
   renderer.renderToGBuffer(camera, standardDeferred, [groundPlane]);
    // render from gbuffers into 32-bit color buffer
    renderer.renderFromGBuffer(camera);
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
