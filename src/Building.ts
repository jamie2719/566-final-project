
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';
import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Mesh from './geometry/Mesh';
import Floors from './Floors';

class Building extends Drawable {
    // holds all the geometry data and sets up individual block attributes
    floors: Floors;
    divisions: number;
    // total 3d max size of building
    dimensions: vec3;
    scale: vec3;
    // contains which grid cells hold a building base
    grid: Array<boolean>;
    // dimensions: size of base layout of the builindg
    // divisions: determines grid construction and building "chunkiness"
    constructor() {
        super();
        this.floors = new Floors();
    }

    placeBlock(x: number, y: number, z: number) {
        let index  = y * this.divisions + x + z * this.divisions * this.divisions;
        this.grid[index] = true;
    }

    hasBlock(x: number, y: number, z: number) : boolean {
        let index  = y * this.divisions + x + z * this.divisions * this.divisions;
        if (index > this.grid.length) {
            return false;
        }
        return this.grid[index];
    }

    calcWorldPos(gridPos: vec3) : vec3 {
        let worldPos = vec3.create();
        vec3.copy(worldPos, gridPos);
        vec3.multiply(worldPos, worldPos, this.scale);
        vec3.subtract(worldPos, worldPos, vec3.fromValues(this.dimensions[0] / 2.0, 0.0, this.dimensions[2] / 2.0));
        return worldPos;
    }

    // prob: probability that a block will be placed in the current block
    buildBase(prob: number) {
        for(let i = 0; i < this.divisions; i++) {
            for (let j = 0; j < this.divisions; j++) {
                let rand = Math.random();
                if (rand <= prob / 100.0) {
                    this.placeBlock(i, 0, j);
                }
            }
        }
        for(let i = 0; i < this.divisions; i++) {
            for (let j = 0; j < this.divisions; j++) {
                let gridPos = vec3.fromValues(i, 0, j)
                if (this.hasBlock(i, 0, j)) {
                    let worldPos = this.calcWorldPos(gridPos);
                    let rotData = this.getBoxRotation(gridPos);
                    let rotation = vec3.fromValues(rotData[0], rotData[1], rotData[2]);
                    this.floors.buildFloor(gridPos, worldPos, vec3.create(), this.scale, rotData[3]);
                }
            }
        }
    }

    buildUp() {
        let center = vec3.fromValues(this.dimensions[0] / 2.0, 0.0, this.dimensions[2] / 2.0);
        let maxPos = vec3.fromValues(this.dimensions[0], this.dimensions[1], this.dimensions[2]);
        maxPos = vec3.subtract(maxPos, maxPos, center);
        let maxDist = vec3.length(maxPos);
        for(let i = 0; i < this.divisions; i++) {
            for (let j = 1; j < this.divisions; j++) {
                for (let k = 0; k < this.divisions; k++) {
                    let rand = Math.random();
                    let gridPos = vec3.fromValues(i, j, k);
                    // towers get shorter as you go further from center
                    if (this.hasBlock(i, j - 1, k)) {
                        let centerDist = vec3.fromValues(i, 0, k);
                        vec3.subtract(centerDist, centerDist, center);
                        let dist = vec3.length(centerDist) / maxDist;
                        rand = rand * dist;
                        if (rand <= .3) {
                            this.placeBlock(i, j, k);
                        }
                    }
                } 
            }
        }
        for(let i = 0; i < this.divisions; i++) {
            for (let j = 1; j < this.divisions; j++) {
                for (let k = 0; k < this.divisions; k++) {
                    let gridPos = vec3.fromValues(i, j, k);
                    if (this.hasBlock(i, j, k)) {
                        let rotData = this.getBoxRotation(gridPos);
                        let rotation = vec3.fromValues(rotData[0], rotData[1], rotData[2]);
                        this.floors.buildFloor(gridPos, this.calcWorldPos(gridPos), rotation, this.scale, rotData[3]);
                    }
                } 
            }
        }
    }

    getBoxRotation(gridPos: vec3): Array<number> {
        let data = new Array<number>();
        // true if they should be bevelled
        let x = gridPos[0];
        let y = gridPos[1];
        let z = gridPos[2];
        let corner0 = true;
        let corner1 = true;
        let corner2 = true;
        let corner3 = true;
        let sum = 4;
        if (this.hasBlock(x, y, z - 1) || this.hasBlock(x + 1, y, z - 1) || this.hasBlock(x + 1, y, z)) {
            corner0 = false;
            sum--;
        }
        if (this.hasBlock(x, y, z - 1) || this.hasBlock(x - 1, y, z - 1) || this.hasBlock(x - 1, y, z)) {
            corner1 = false;
            sum--;
        }
        if (this.hasBlock(x - 1, y, z) || this.hasBlock(x - 1, y, z + 1) || this.hasBlock(x, y, z + 1)) {
            corner2 = false;
            sum--;
        }
        if (this.hasBlock(x, y, z + 1) || this.hasBlock(x + 1, y, z + 1) || this.hasBlock(x + 1, y, z)) {
            corner3 = false;
            sum--;
        }
        if (sum == 0) {
            data.push(0, 0, 0, 0);
        } else if (sum == 1) {
            if (corner0) {
                data.push(0, 0, 0, 1);
            } else if (corner1) {
                data.push(0, -90, 0, 1);
            } else if (corner0) {
                data.push(0, -180, 0, 1);
            } else if (corner3) {
                data.push(0, -270, 0, 1);
            }
        } else if (sum == 2) {
            console.log(gridPos)
            if (corner0 && corner1) {
                console.log("1");
                data.push(0, 90, 0, 2);
            } else if (corner1 && corner2) {
                console.log("2");
                data.push(0, -270, 0, 2);
            } else if (corner2 && corner3) {
               // console.log("3");
                data.push(0, 270, 0, 2);
            } else if (corner0 && corner3) {
                console.log("4");
                data.push(0, 90, 0, 2);
            }
        } else{
            data.push(0, 0, 0, 4);
        }
        return data;
    }

    build(dimensions: vec3, divisions: number, prob: number) {
        this.dimensions = dimensions;
        this.divisions = divisions;
        this.scale = vec3.fromValues(this.dimensions[0] / this.divisions,
            this.dimensions[1] / this.divisions,
            this.dimensions[2] / this.divisions);
        this.grid = new Array<boolean>(this.divisions * this.divisions * this.divisions).fill(false);
        this.buildBase(prob);
        //this.buildUp();
        this.create();
    }

    toRadians(d: number): number {
        return d * Math.PI / 180.0;
    }
    
    create() {
        this.floors.create();
    }
 }

export default Building;