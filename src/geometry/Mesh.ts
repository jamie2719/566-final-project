import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as Loader from 'webgl-obj-loader';

class Mesh extends Drawable {

  posTemp: Array<number> = [];
  norTemp: Array<number> = [];
  colTemp: Array<number> = [];
  uvsTemp: Array<number> = [];
  idxTemp: Array<number> = [];
  typeTemp: Array<number> = [];
  lastIdx: number = 0;
  
  center: vec4;
  scale: vec3;
  rotation: vec3;
  type: number;

  objString: string;

  constructor(objString: string, center: vec3, scale: vec3, rotation: vec3, color: vec4, type: number) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.type = type;
    this.objString = objString;

    var loadedMesh = new Loader.Mesh(this.objString);

    for (var i = 0; i < loadedMesh.vertices.length; i+=3) {
      let pos = vec4.fromValues(loadedMesh.vertices[i], loadedMesh.vertices[i + 1], loadedMesh.vertices[i + 2], 1);
      let nor = vec4.fromValues(loadedMesh.vertexNormals[i], loadedMesh.vertexNormals[i + 1], loadedMesh.vertexNormals[i + 2], 0);
      pos[0] *= scale[0];
      pos[1] *= scale[1];
      pos[2] *= scale[2];
      let rotationMat = mat4.create();
      mat4.rotate(rotationMat, rotationMat, this.degreesToRadians(rotation[0]), vec3.fromValues(1, 0, 0));
      mat4.rotate(rotationMat, rotationMat, this.degreesToRadians(rotation[1]), vec3.fromValues(0, 1, 0));
      mat4.rotate(rotationMat, rotationMat, this.degreesToRadians(rotation[2]), vec3.fromValues(0, 0, 1));
      vec4.transformMat4(pos, pos, rotationMat);
      vec4.transformMat4(nor, nor, rotationMat);
      // move position to the input center
      vec4.add(pos, [center[0], center[1], center[2], 1], pos);
      this.posTemp.push(pos[0], pos[1], pos[2], 1.0);
      this.norTemp.push(nor[0], nor[1], nor[2], 0.0);
    }

    this.uvsTemp = loadedMesh.textures;
    this.idxTemp = loadedMesh.indices;

    // white vert color for now
    for (var i = 0; i < this.posTemp.length; i+=4){
      this.colTemp[i] = color[0];
      this.colTemp[i + 1] = color[1];
      this.colTemp[i + 2] = color[2];
      this.colTemp[i + 3] = color[3];
    }
    console.log(this.posTemp.length);

    for (var i = 0; i < this.posTemp.length / 4.0; ++i){
      this.typeTemp.push(this.type);
    }
    this.lastIdx = this.posTemp.length / 4.0;
  }

  degreesToRadians(x: number): number {
    return x * (3.14159 / 180.0);
  }

  addMeshComponent(m: Mesh) {
    this.posTemp = this.posTemp.concat(m.posTemp);
    this.norTemp = this.norTemp.concat(m.norTemp);
    this.colTemp = this.colTemp.concat(m.colTemp);
    this.uvsTemp = this.uvsTemp.concat(m.uvsTemp);
    this.typeTemp = this.typeTemp.concat(m.typeTemp);

    let n = m.idxTemp.length;
    for(let j = 0; j < n; j++) {
        this.idxTemp.push(m.idxTemp[j] + this.lastIdx);
    }
    this.lastIdx += m.posTemp.length / 4.0;

    return this;
    
  }

  create() { 
    
    let indices = new Uint32Array(this.idxTemp);
    let normals = new Float32Array(this.norTemp);
    let positions = new Float32Array(this.posTemp);
    let colors = new Float32Array(this.colTemp);
    let uvs = new Float32Array(this.uvsTemp);
    let types = new Float32Array(this.typeTemp);
    
    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateUV();
    this.generateCol();
    this.generateType();

    this.count = indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufType);
    gl.bufferData(gl.ARRAY_BUFFER, types, gl.STATIC_DRAW);

    this.objString = ""; // hacky clear
  }
};

export default Mesh;
