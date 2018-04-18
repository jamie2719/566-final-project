
import {vec3, mat4} from 'gl-matrix';

class Light {
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
  up: vec3 = vec3.fromValues(0, 1, 0);
  eye: vec3;
  center: vec3;
  

  constructor(position: vec3, target: vec3) {
    
    this.eye = position,
    this.center =  target,
    vec3.add(this.target, this.position, this.direction);
    mat4.lookAt(this.viewMatrix, this.eye, this.center, this.up);

console.log("Center: " + this.center);
console.log("Eye: " + this.eye);
console.log("view mat: " + this.viewMatrix);

    var scale = 50.0;
    mat4.ortho(this.orthogonalMatrix, -scale, scale, -scale, scale, -scale, scale);
  }

  setAspectRatio(aspectRatio: number) {
    this.aspectRatio = aspectRatio;
  }

  updateProjectionMatrix() {
    
    mat4.perspective(this.projectionMatrix, this.fovy, this.aspectRatio, this.near, this.far);
    
  }

  update() {

    //vec3.add(this.target, this.position, this.direction);
    //mat4.lookAt(this.viewMatrix, this.eye, this.center, this.up);

    
    mat4.multiply(this.viewProjMatrix, this.projectionMatrix, this.viewMatrix);
    mat4.invert(this.invViewProjMatrix, this.viewProjMatrix);
    mat4.multiply(this.viewOrhtProjMatrix, this.orthogonalMatrix, this.viewMatrix);

  }
};

export default Light;
