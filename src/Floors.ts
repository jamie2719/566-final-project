
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';
import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Mesh from './geometry/Mesh';

class Floors extends Drawable{
    mesh: Mesh;
    // objs
    block0: any;
    block1: any;
    block2: any;
    block4: any;
    window1: any;
    roof1: any;
    // dimensions: size of base layout of the builindg
    // divisions: determines grid construction and building "chunkiness"
    constructor() {
        super();
    }

    buildFloor(gridPos: vec3, worldPos: vec3, rotate: vec3, scale: vec3, bevelNum: number) {
        let block = this.block0;
        if (bevelNum == 1) {
            block = this.block1;
        } else if (bevelNum == 2) {
            block = this.block2;
        } else if (bevelNum == 4) {
            block = this.block4;
        }
        if(this.mesh == null) {
            this.mesh = new Mesh(block, worldPos, scale, rotate, 0.2);
        } else {
            let newMesh = new Mesh(block, worldPos, scale, rotate, 0.2);
            this.mesh.addMeshComponent(newMesh);
        }
    }

    toRadians(d: number): number {
        return d * Math.PI / 180.0;
    }

    create() {
        if (this.mesh != null) {
            console.log("HAS MESH")
            this.mesh.create();
        }  
    }
 }

export default Floors;