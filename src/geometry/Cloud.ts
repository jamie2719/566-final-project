import {vec3, vec4} from 'gl-matrix';
import Mesh from './Mesh';

class Cloud {
    // for use in Verlet integration when finding new position
    prevTime : number;
    prevPos: Array<Array<number>>;
    Pi: number = 3.1415;

    position: Array<Array<number>>;
    // number of quads being drawn
    numClouds: number;
    boundingVal: number;
    offsetsArray: number[];
    colorsArray: number[];

    color: number[] = [1.0, 1.0, 1.0, 1.0];

    constructor() {
        // square root of number of particles to start
        this.numClouds = 4;
        this.boundingVal = 300;
        this.prevTime = 0;

        this.position = new Array<Array<number>>();
        this.prevPos = new Array<Array<number>>();

        this.offsetsArray = [];
        this.colorsArray = [];
        let speedScale = 4;
        let minZBound = 50;
        // have all points initially lie in a plane
        let n = this.numClouds;
        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                // generate random starting velocity for points
                let x = (Math.random() * this.boundingVal) - (this.boundingVal / 2.0);// / this.boundingVal;
                let y = Math.random() * 100.0;
                let z = -(Math.random() * this.boundingVal + 300.0);/// this.boundingVal - minZBound;
                let x2 = x + Math.random() * .6; // give x velocity in -x direction 
                let y2 = y;
                let z2 = z;
                this.position.push([x, y, z]);
                this.prevPos.push([x2, y2, z2]);

                this.offsetsArray.push(x);
                this.offsetsArray.push(y);
                this.offsetsArray.push(z);

                this.colorsArray.push(i / n);
                this.colorsArray.push(j / n);
                this.colorsArray.push(1.0);
                this.colorsArray.push(1.0); // Alpha channel
            }
        }
    }
    // set data of colors and offsets
    // used to set data of square instances in main.ts
    setData() {
        let n = this.numClouds;
        this.offsetsArray = [];
        this.colorsArray = [];
        let color = [];

        for(let i = 0; i < n * n; i++) {

            this.offsetsArray.push(this.position[i][0]);
            this.offsetsArray.push(this.position[i][1]);
            this.offsetsArray.push(this.position[i][2]);

            this.colorsArray.push(this.color[0]);
            this.colorsArray.push(this.color[1]);
            this.colorsArray.push(this.color[2]);
            this.colorsArray.push(1.0);
            
        }
    }

    // updates position data based on time and particle attributes
    update(time: number) {
        // verlet integration over each offset
        for(let i = 0; i < this.numClouds * this.numClouds; i++) {               
            let newPos = vec3.create();
            let changePos = vec3.create();
            let accelTerm = vec3.create();
            let acceleration = vec3.create();

            // p + (p - p*)
            vec3.add(newPos, newPos, this.position[i]);
            vec3.subtract(changePos, this.position[i], this.prevPos[i]);
            vec3.add(newPos, newPos, changePos);
            let currPos = vec3.fromValues(this.position[i][0], this.position[i][1], this.position[i][2]);
            // set previous position to be current position
            this.prevPos[i] = [this.position[i][0], this.position[i][1], this.position[i][2]];

            // if particle is at edge of bounding box, reverse direction
             if(Math.abs(newPos[0]) > this.boundingVal) {
                this.prevPos[i] = [this.boundingVal + Math.random() * .6, this.position[i][1], this.position[i][2]];
                newPos = vec3.fromValues(this.boundingVal, this.position[i][1], this.position[i][2]);
            }

            // set current position to be newly calculated position
            this.position[i] = [newPos[0], newPos[1], newPos[2]];
    }
        this.prevTime = time;
    }

    // apply a force to a single particle at index i
    // returns the acceleration of the particle
    applyParticleForce(f: vec3): vec3 {
        let mass = 2;
        let a = vec3.create();
        vec3.scale(a, f, 1 / mass);
        return vec3.fromValues(a[0], a[1], a[2]);
    }

    getColors(): number[] {
        return this.colorsArray;
    }

    getOffsets(): number[] {
        return this.offsetsArray;
    }

    getNumParticles(): number {
        return this.numClouds;
    }
}

export default Cloud;