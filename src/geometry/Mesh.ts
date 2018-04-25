import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as Loader from 'webgl-obj-loader';

class Mesh extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  offsets: Float32Array; // Data for bufTranslate
  normals: Float32Array;
  colors: Float32Array;
  types: Float32Array;
  uvs: Float32Array;
  center: vec4;
  type: number;

  objString: string;

  constructor(objString: string, center: vec3, type: number) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.type = type;
    this.objString = objString;

    let posTemp: Array<number> = [];
    let norTemp: Array<number> = [];
    let uvsTemp: Array<number> = [];
    let idxTemp: Array<number> = [];

    var loadedMesh = new Loader.Mesh(this.objString);

    //posTemp = loadedMesh.vertices;
    for (var i = 0; i < loadedMesh.vertices.length; i++) {
      posTemp.push(loadedMesh.vertices[i]);
      if (i % 3 == 2) posTemp.push(1.0);
    }

    for (var i = 0; i < loadedMesh.vertexNormals.length; i++) {
      norTemp.push(loadedMesh.vertexNormals[i]);
      if (i % 3 == 2) norTemp.push(0.0);
    }

    uvsTemp = loadedMesh.textures;
    idxTemp = loadedMesh.indices;

    // white vert color for now
    this.colors = new Float32Array(posTemp.length);
    this.types = new Float32Array(posTemp.length / 4.0);
    for (var i = 0; i < posTemp.length; ++i){
      this.colors[i] = 1.0;
    }

    for (var i = 0; i < posTemp.length / 4.0; ++i){
      this.types[i] = this.type;
    }


    this.indices = new Uint32Array(idxTemp);
    this.normals = new Float32Array(norTemp);
    this.positions = new Float32Array(posTemp);
    this.uvs = new Float32Array(uvsTemp);

  }

  addMeshComponent(m: Mesh) {
    if(this.positions.length != 0) {
      var tempP = this.positions;
      this.positions = new Float32Array(tempP.length + m.positions.length);
      this.positions.set(tempP);
      this.positions.set(m.positions, tempP.length);
    }
    else {
      this.positions = new Float32Array(m.positions.length);
      this.positions.set(m.positions);
    }

    if(this.normals != null) {
      var tempN = this.normals;
      this.normals = new Float32Array(tempN.length + m.normals.length);
      this.normals.set(tempN);
      this.normals.set(m.normals, tempN.length);
    }
    else {
      this.normals.set(m.normals);
    }

    if(this.indices != null) {

      var tempI = this.indices;
      this.indices = new Uint32Array(tempI.length + m.indices.length);
      this.indices.set(tempI);
      var j = tempI.length;
      for(var i = 0; i < m.indices.length; i++) {
        this.indices[j] = m.indices[i] + tempI.length/4;
        j++;
      }
    }
    else {
      this.indices.set(m.indices);
    }

    if(this.colors != null) {
      var tempC = this.colors;
      this.colors = new Float32Array(tempC.length + m.colors.length);
      this.colors.set(tempC);
      this.colors.set(m.colors, tempC.length);
    }
    else {
      this.colors.set(m.colors);
    }

    if(this.uvs != null) {
      var tempUV = this.uvs;
      this.uvs = new Float32Array(tempUV.length + m.uvs.length);
      this.uvs.set(tempUV);
      this.uvs.set(m.uvs, tempUV.length);
    }
    else {
      this.uvs.set(m.uvs);
    }

    if(this.types != null) {
      var tempT = this.types;
      this.types = new Float32Array(tempT.length + m.types.length);
      this.types.set(tempT);
      this.types.set(m.types, tempT.length);
    }
    else {
      this.types.set(m.types);
    }

    this.count = this.indices.length;

    return this;
  }

  create() {  
    
    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateUV();
    this.generateCol();
    this.generateType();
    

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufType);
    gl.bufferData(gl.ARRAY_BUFFER, this.types, gl.STATIC_DRAW);


    console.log(`Created Mesh from OBJ`);
    this.objString = ""; // hacky clear
  }

  setInstanceVBOs(offsets: Float32Array, colors: Float32Array) {
    this.offsets = offsets;
    this.generateTranslate();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);
  }
};

export default Mesh;
