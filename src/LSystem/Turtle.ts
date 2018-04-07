import {vec3, vec4, mat3, mat4} from 'gl-matrix';


function degToRad(deg: number) {
    return deg * 3.14159265 / 180.0;

}


class Turtle {
    currPos: vec3;
    currDir: vec3;
    rotMat: mat4;
    next: Turtle;
    prev: Turtle;
 
    constructor(pos : vec3) {
        this.currPos = vec3.create();
        vec3.set(this.currPos, pos[0], pos[1], pos[2]);
        this.currDir = vec3.create();
        this.currDir = vec3.fromValues(0, 1, 0);

        this.rotMat = mat4.create();
    }


    computeRotMat(currRot: vec3) : mat4 {
        var empty = mat4.create();
        var rotx = degToRad(currRot[0]);
        var roty = degToRad(currRot[1]);
        var rotz = degToRad(currRot[2]);

        var rotatex = mat4.rotateX(mat4.create(), mat4.create(), rotx);
        var rotatey = mat4.rotateY(mat4.create(), mat4.create(), roty); 
        var rotatez = mat4.rotateZ(mat4.create(), mat4.create(), rotz); 
        mat4.multiply(rotatex, rotatex, rotatey); 
        mat4.multiply(rotatex, rotatex, rotatez);
        return rotatex;
    }

    moveForward(z: number) {
        var amount: vec3 = vec3.create();
        vec3.scale(amount, this.currDir, z);
        this.currPos = vec3.add(this.currPos, this.currPos, amount);
    
    }


    rotate(rot : vec3) {
        //create rotation matrix for new rotation
        var newRot = mat4.create();
        newRot = (this.computeRotMat(rot));

        //multilpy current rotation matrix by new rotation
        mat4.multiply(this.rotMat, this.rotMat, newRot);

        //rotate dir by total rotation matrix
        vec3.transformMat4(this.currDir, vec3.fromValues(0, 1, 0), this.rotMat); 

            
    }

    static linkTurtles(first: Turtle, second: Turtle) {
        if(first != null) {
            first.next = second;
        }
        if(second != null) {
            second.prev = first;
        }
        
    }

    
};
export default Turtle;