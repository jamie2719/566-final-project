import * as CameraControls from '3d-view-controls';
import {vec3, mat4} from 'gl-matrix';

class Camera {
  controls: any;
  projectionMatrix: mat4 = mat4.create();
  orthogonalMatrix: mat4 = mat4.create();
  viewMatrix: mat4 = mat4.create();
  viewProjMatrix: mat4 = mat4.create();
  invViewProjMatrix: mat4 = mat4.create();
  viewOrhtProjMatrix: mat4 = mat4.create();
  fovy: number = 45 * 3.1415962 / 180.0;
  aspectRatio: number = 1;
  near: number = 0.1;
  far: number = 1000;

  position: vec3 = vec3.create();
  direction: vec3 = vec3.create();
  target: vec3 = vec3.create();
  up: vec3 = vec3.create();

  constructor(position: vec3, target: vec3) {
    this.controls = CameraControls(document.getElementById('canvas'), {
      eye: position,
      center: target,
    });
    this.controls.mode = 'turntable';
    vec3.add(this.target, this.position, this.direction);
    mat4.lookAt(this.viewMatrix, this.controls.eye, this.controls.center, this.controls.up);
    var scale = 20.0;
    mat4.ortho(this.orthogonalMatrix, -scale, scale, -scale, scale, this.near, this.far);
  }

  setAspectRatio(aspectRatio: number) {
    this.aspectRatio = aspectRatio;
  }

  updateProjectionMatrix() {
    
    mat4.perspective(this.projectionMatrix, this.fovy, this.aspectRatio, this.near, this.far);
    
  }

  update() {
    this.controls.tick();

    vec3.add(this.target, this.position, this.direction);
    mat4.lookAt(this.viewMatrix, this.controls.eye, this.controls.center, this.controls.up);

    
    mat4.multiply(this.viewProjMatrix, this.projectionMatrix, this.viewMatrix);
    mat4.invert(this.invViewProjMatrix, this.viewProjMatrix);
    mat4.multiply(this.viewOrhtProjMatrix, this.orthogonalMatrix, this.viewMatrix);

  }
};

export default Camera;
