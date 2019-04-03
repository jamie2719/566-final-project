
import {vec3, vec2, vec4, mat4} from 'gl-matrix';


import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Mesh from './geometry/Mesh';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import Light from './Light';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Texture from './rendering/gl/Texture';
import Building from './Building'

const controls = {
  Divisions: 4,
  Height: 50,
  Density: 70,

  Reload: function() {loadScene()}
};

let boxS: string;
// number signifies number of bevelled edges
let box1S: string;
let box2S: string;
let box4S: string;
let window1S: string;

let building: Building

let brickTex: Texture;

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
  boxS = readTextFile('./src/resources/obj/cube.obj');
  box1S = readTextFile('./src/resources/obj/block1.obj');
  box2S = readTextFile('./src/resources/obj/block2.obj');
  box4S = readTextFile('./src/resources/obj/block4.obj');
  window1S = readTextFile('./src/resources/obj/window1.obj');
}


function loadScene() {
  building && building.destroy();
  brickTex = new Texture('./src/resources/textures/lilac.png');

  building = new Building();
  building.floors.block0 = boxS;
  building.floors.block1 = box1S;
  building.floors.block2 = box2S;
  building.floors.block4 = box4S;
  building.floors.window1 = window1S;
  building.build(controls.Height.valueOf(),
        controls.Divisions.valueOf(),
        controls.Density.valueOf());
}


function main() {

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // add controls to gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Divisions', 1.0, 10.0).step(1.0);
  gui.add(controls, 'Height', 1.0, 100.0).step(1.0);
  gui.add(controls, 'Density', 0.0, 100.0).step(1.0);
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

  const camera = new Camera(vec3.fromValues(0, 10, 20), vec3.fromValues(0, 0, 0));
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

  standardDeferred.setupTexUnits(["tex_Color0"]);
  standardDeferred.setupTexUnits(["tex_Color1"]);
  standardDeferred.setupTexUnits(["tex_Color2"]);
  standardDeferred.setupTexUnits(["tex_Color3"]);
  standardDeferred.setupTexUnits(["tex_Color4"]);

  gl.enable(gl.BLEND);
  // renderer.setLightMatrices(shadowMat, light.projectionMatrix, light.viewMatrix);
  standardDeferred.setProjMatrix(camera.projectionMatrix);

  function tick() {
    camera.update();

    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    timer.updateTime();
    renderer.updateTime(timer.deltaTime, timer.currentTime);

    renderer.setDimensions(vec2.fromValues(window.innerWidth, window.innerHeight));
    standardDeferred.bindTexToUnit("tex_Color1", brickTex, 0);

    renderer.clear();
    renderer.clearGB();

    // TODO: pass any arguments you may need for shader passes
    // forward render mesh info into gbuffers
    renderer.renderToGBuffer(camera, light, standardDeferred, [building.floors.mesh]);
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
