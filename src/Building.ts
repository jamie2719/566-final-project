
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';
import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Mesh from './geometry/Mesh';
import Floors from './Floors';

class Building extends Drawable {
    // holds all the geometry data and sets up individual block attributes
    numBlocks: number = 0;
    floors: Floors;
    divisions: number;
    // total 3d max size of building
    dimensions: vec3;
    scale: vec3;
    // contains which grid cells hold a building base
    grid: Array<number>;
    // dimensions: size of base layout of the builindg
    // divisions: determines grid construction and building "chunkiness"
    constructor() {
        super();
        this.floors = new Floors();
    }

    placeBlock(x: number, y: number, z: number, id: number) {
        let index  = y * this.divisions + x + z * this.divisions * this.divisions;
        this.grid[index] = id;
    }

    hasBlock(x: number, y: number, z: number) : boolean {
        let index  = y * this.divisions + x + z * this.divisions * this.divisions;
        if (index > this.grid.length) {
            return false;
        }
        return !(this.grid[index] == -1);
    }

    getBlockAt(x: number, y: number, z: number): number {
        let index  = y * this.divisions + x + z * this.divisions * this.divisions;
        if (index > this.grid.length) {
            return -1;
        }
        return this.grid[index];
    }

    calcWorldPos(gridPos: vec3, scale: vec3) : vec3 {
        let worldPos = vec3.create();
        vec3.copy(worldPos, gridPos);
        vec3.multiply(worldPos, worldPos, this.scale);
        //vec3.subtract(worldPos, worldPos, vec3.fromValues(this.dimensions[0] / 2.0, 0.0, this.dimensions[2] / 2.0));
        return worldPos;
    }

    // prob: probability that a block will be placed in the current block
    buildBase(prob: number) {
        
        for(let i = 0; i < this.divisions; i++) {
            for (let j = 0; j < this.divisions; j++) {
                let rand = Math.random();
                if (rand <= prob / 100.0) {
                    if (!this.hasBlock(i, 0, j)) {
                        let scaleX = Math.floor(Math.random() * this.dimensions[0] / 2.0)
                        let scaleY = Math.floor(Math.random() * this.dimensions[1])
                        let scaleZ = scaleX;
                        scaleX = Math.min(Math.max(2.0, scaleX), this.dimensions[0])
                        scaleY = 3;//Math.min(Math.max(this.dimensions[1] / 4.0, scaleY), this.dimensions[1])
                        scaleZ = scaleX;//Math.min(Math.max(2.0, scaleZ), this.dimensions[2])
                        this.placeBlock(i, 0, j, this.numBlocks);
                        let gridPos = vec3.fromValues(i, 0, j)
                        let worldPos = this.calcWorldPos(gridPos, vec3.fromValues(scaleX, scaleY , scaleZ));
                        let rotData = this.getBoxRotation(gridPos, vec3.fromValues(scaleX , scaleY , scaleZ));
                        let rotation = vec3.fromValues(rotData[0], rotData[1], rotData[2]);
                        this.floors.buildFloor(gridPos, worldPos, rotation, 
                            vec3.fromValues(scaleX * this.scale[0], scaleY * this.scale[1] , scaleZ * this.scale[2]), rotData[3]);

                        // fill in grid where there are blocks occupying
                        for (let x = 0; x < scaleX; x++) {
                            for (let y = 0; y < scaleY; y++) {
                                for (let z = 0; z < scaleZ; z++) {
                                    this.placeBlock(i + x, y, j + z, this.numBlocks);
                                }
                            } 
                        }
                        this.numBlocks++;
                        /*
                        console.log("WORLD POS");
                        console.log(worldPos);
                        console.log("i and j");
                        console.log(i);
                        console.log(j);
                        console.log("OVERALL SCALE");
                        console.log(this.scale);
                        */
                    }
                }
            }
        }
        /*
       let worldPos = this.calcWorldPos(vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1));
       this.floors.buildFloor(vec3.fromValues(0, 0, 0), worldPos, vec3.fromValues(0, 0, 0), 
        vec3.fromValues(1 * this.scale[0], 1 * this.scale[1] , 1 * this.scale[2]), 0);

        worldPos = this.calcWorldPos(vec3.fromValues(2, 0, 0), vec3.fromValues(1, 1, 1));
        this.floors.buildFloor(vec3.fromValues(2, 0, 0), worldPos, vec3.fromValues(0, 0, 0), 
        vec3.fromValues(1 * this.scale[0], 1 * this.scale[1] , 1 * this.scale[2]), 0);

        worldPos = this.calcWorldPos(vec3.fromValues(4, 0, 0), vec3.fromValues(1, 1, 1));
        this.floors.buildFloor(vec3.fromValues(4, 0, 0), worldPos, vec3.fromValues(0, 0, 0), 
        vec3.fromValues(1 * this.scale[0], 1 * this.scale[1] , 1 * this.scale[2]), 0);

        console.log(this.scale);
        */
    }

    // buildUp() {
    //     let center = vec3.fromValues(this.dimensions[0] / 2.0, 0.0, this.dimensions[2] / 2.0);
    //     let maxPos = vec3.fromValues(this.dimensions[0], this.dimensions[1], this.dimensions[2]);
    //     maxPos = vec3.subtract(maxPos, maxPos, center);
    //     let maxDist = vec3.length(maxPos);
    //     for(let i = 0; i < this.divisions; i++) {
    //         for (let j = 1; j < this.divisions; j++) {
    //             for (let k = 0; k < this.divisions; k++) {
    //                 let rand = Math.random();
    //                 let gridPos = vec3.fromValues(i, j, k);
    //                 // towers get shorter as you go further from center
    //                 if (this.hasBlock(i, j - 1, k)) {
    //                     let centerDist = vec3.fromValues(i, 0, k);
    //                     vec3.subtract(centerDist, centerDist, center);
    //                     let dist = vec3.length(centerDist) / maxDist;
    //                     rand = rand * dist;
    //                     if (rand <= .3) {
    //                         this.placeBlock(i, j, k);
    //                     }
    //                 }
    //             } 
    //         }
    //     }
    //     for(let i = 0; i < this.divisions; i++) {
    //         for (let j = 1; j < this.divisions; j++) {
    //             for (let k = 0; k < this.divisions; k++) {
    //                 let gridPos = vec3.fromValues(i, j, k);
    //                 if (this.hasBlock(i, j, k)) {
    //                     let rotData = this.getBoxRotation(gridPos);
    //                     let rotation = vec3.fromValues(rotData[0], rotData[1], rotData[2]);
    //                     this.floors.buildFloor(gridPos, this.calcWorldPos(gridPos), rotation, this.scale, rotData[3]);
    //                 }
    //             } 
    //         }
    //     }
    // }

    getBoxRotation(gridPos: vec3, scale: vec3): Array<number> {
        let currId = this.getBlockAt(gridPos[0], gridPos[1], gridPos[2]);
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
        if ((this.hasBlock(x, y, z - 1) && this.getBlockAt(x, y, z - 1) != currId) || 
            (this.hasBlock(x - 1, y, z - 1) && this.getBlockAt(x - 1, y, z - 1) != currId) || 
            (this.hasBlock(x - 1, y, z) && this.getBlockAt(x - 1, y, z) != currId)) {
            corner0 = false;
            sum--;
        }
        z = gridPos[2] + scale[2];
        if ((this.hasBlock(x, y, z + 1) && this.getBlockAt(x, y, z + 1) != currId) || 
            (this.hasBlock(x - 1, y, z + 1) && this.getBlockAt(x - 1, y, z + 1) != currId) || 
            (this.hasBlock(x - 1, y, z) && this.getBlockAt(x - 1, y, z) != currId)) {
            corner1 = false;
            sum--;
        }
        x = gridPos[0] + scale[0];
        if ((this.hasBlock(x + 1, y, z) && this.getBlockAt(x + 1, y, z) != currId) || 
            (this.hasBlock(x + 1, y, z + 1) && this.getBlockAt(x + 1, y, z + 1) != currId) || 
            (this.hasBlock(x, y, z + 1) && this.getBlockAt(x, y, z + 1) != currId)) {
            corner2 = false;
            sum--;
        }
        z = gridPos[2];
        if ((this.hasBlock(x, y, z - 1) && this.getBlockAt(x, y, z - 1) != currId) || 
            (this.hasBlock(x + 1, y, z - 1) && this.getBlockAt(x + 1, y, z - 1) != currId) || 
            (this.hasBlock(x + 1, y, z) && this.getBlockAt(x + 1, y, z) != currId)) {
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
        this.grid = new Array<number>(this.divisions * this.divisions * this.divisions).fill(-1);
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