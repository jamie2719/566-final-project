import ExpansionRule from './ExpansionRule';
import CharNode from './CharNode';
import Turtle from './Turtle';
import {vec3, vec4} from 'gl-matrix';
import {mat4} from 'gl-matrix';
import Mesh from '../geometry/Mesh';
import {readTextFile} from '../globals';


class TurtleParser {
    renderGrammar : Map<string, Function>;
    seed: string;
    currTurtle: Turtle;
    defaultBranch: Mesh;
    defaultLeaf: Mesh;
    currBranch: Mesh;
    turtleHead: Turtle;
    branchS: string;
    leafS: string;

    constructor(curr: Turtle) {

        this.currTurtle = curr;
        this.turtleHead = null;
        this.renderGrammar = new Map<string, Function>();
        this.branchS = readTextFile('./src/resources/obj/branch1OBJ.obj');
        this.leafS = readTextFile('./src/resources/obj/leaf.obj');
    }


    shiftBranch(center:vec3, newBranch: Mesh) {
        for(var i = 0; i < newBranch.positions.length; i+=4) {
            newBranch.positions[i] += center[0];
            newBranch.positions[i+1] += center[1];
            newBranch.positions[i+2] += center[2];
        }

        return newBranch;
    }

    shiftLeaf(center:vec3, newLeaf: Mesh) {
        for(var i = 0; i < newLeaf.positions.length; i+=4) {
            newLeaf.positions[i] += center[0];
            newLeaf.positions[i+1] += center[1];
            newLeaf.positions[i+2] += center[2];
        }

        return newLeaf;
    }

    createBranch(center: vec3) {
        var newBranch = new Mesh(this.branchS, center, .5);
        return newBranch;
    }

    createLeaf(center: vec3) {
        var newLeaf = new Mesh(this.leafS, center, .6);
        return newLeaf;
    }




    static VBOtoVec4(arr: Float32Array) {
        var vectors: Array<vec4> = new Array<vec4>();
        for(var i = 0; i < arr.length; i+=4) {
          var currVec = vec4.fromValues(arr[i], arr[i+1], arr[i+2], arr[i+3]);
          vectors.push(currVec);
        }
        return vectors;
      }
      
      transformVectors(vectors: Array<vec4>, transform: mat4) {
        for(var i = 0; i < vectors.length; i++) {
            var newVector: vec4 = vec4.create();
            newVector = vec4.transformMat4(newVector, vectors[i], transform);
 
            vectors[i] = newVector;
        }
        return vectors;
      }
      
      // Just converts from vec4 to floats for VBOs
      static Vec4toVBO(vectors: Array<vec4>) {
        var j: number = 0;
        var arr = new Float32Array(vectors.length*4);
        for(var i = 0; i < vectors.length; i++) {
            var currVec = vectors[i];
            arr[j] = currVec[0];
            arr[j+1] = currVec[1];
            arr[j+2] = currVec[2];
            arr[j+3] = currVec[3];
            j+=4;
        }
        return arr;
      }


     // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind 
    // functions to grammar symbols.
    renderSymbol(symbolNode: CharNode, meshDrawable: Mesh) {
        //var func = this.renderGrammar.get(symbolNode.char);

        if(symbolNode.char == 'F') {
            //store old turtlePos
            var oldTurtlePos = vec3.create();
            oldTurtlePos.set(this.currTurtle.currPos); //

            this.currTurtle.moveForward(28, this.currTurtle.currDir);
            //translate turtle forward
            // if(this.turtleHead != null) {
                
            //     this.currTurtle.moveForward(25, this.turtleHead.currDir);
            // }
            // else {
            //     //this.currTurtle.moveForward(50, vec3.fromValues(0, 1, 0));
            // }

            //find center of new branch- average of old pos and new pos
            var newCenter = vec3.create();
            vec3.add(newCenter, oldTurtlePos, this.currTurtle.currPos);
            vec3.scale(newCenter, newCenter, .5);


            //convert positions (of default branch) into vec4s, transform, and convert back
            var posVectors = TurtleParser.VBOtoVec4(this.defaultBranch.positions);
            var norVectors = TurtleParser.VBOtoVec4(this.defaultBranch.normals);
            
            posVectors = this.transformVectors(posVectors, this.currTurtle.rotMat);
            norVectors = this.transformVectors(norVectors, this.currTurtle.rotMat); //change to inverse transpose
 
            //create new branch at that new center point
            var newBranch = this.createBranch(newCenter);

            newBranch.positions = TurtleParser.Vec4toVBO(posVectors);
            newBranch.normals = TurtleParser.Vec4toVBO(norVectors);

            //shift positions of default branch so new branch is at correct offset
            newBranch = this.shiftBranch(newCenter, newBranch);

            //newBranch.create();
            //actually draw branch
            meshDrawable = meshDrawable.addMeshComponent(newBranch);

            //add ending leaf next to F after last iteration finishes expanding


        }

        //rotate around x axis
        else if(symbolNode.char == '+') {
            this.currTurtle.rotate(vec3.fromValues(30, 0, 0));
        }
        else if(symbolNode.char == '-') {
            this.currTurtle.rotate(vec3.fromValues(-30, 0, 0));
        }
        //rotate around y axis
        else if(symbolNode.char == '>') {
            this.currTurtle.rotate(vec3.fromValues(0, 30, 0));
        }
        else if(symbolNode.char == '<') {
            this.currTurtle.rotate(vec3.fromValues(0, -30, 0));
        }
        // rotate around z axis
        else if(symbolNode.char == '*') {
            this.currTurtle.rotate(vec3.fromValues(0, 0, -30));
        }
        else if(symbolNode.char == '.') {
            this.currTurtle.rotate(vec3.fromValues(0, 0, 30));
        }



        else if(symbolNode.char == '[') {
            //var parentTransform = mat4.create();
            //push new turtle with current state onto stack

            //console.log("currTurtle before push: " + this.currTurtle.currDir);
            var newHead = new Turtle(this.currTurtle.currPos, this.currTurtle.currDir, this.currTurtle.rotMat); 
        
            if(this.turtleHead != null) {

            //console.log("turtleHead before push: " + this.turtleHead.currDir);
                var temp = this.turtleHead;
                Turtle.linkTurtles(newHead, temp);
            }
            this.turtleHead = newHead;
        }
        else if(symbolNode.char == ']') {
            //pop off head of stack and set curr to that
            if(this.turtleHead != null) {
                var temp = new Turtle(this.turtleHead.currPos, this.turtleHead.currDir, this.turtleHead.rotMat);
                this.currTurtle = temp;
                this.turtleHead = this.turtleHead.next;
                //console.log("currTurtle after pop: " + this.currTurtle.currDir);
                if(this.turtleHead!=null) {
                    //console.log("turtleHead after pop: " + this.turtleHead.currDir); 
                }
                else {
                    //console.log("turtle head is null");
                }
            }

         
        }
        else if(symbolNode.char == 'L') {
           var posVectors = TurtleParser.VBOtoVec4(this.defaultLeaf.positions);
              var norVectors = TurtleParser.VBOtoVec4(this.defaultLeaf.normals);
              
              posVectors = this.transformVectors(posVectors, this.currTurtle.rotMat);
              norVectors = this.transformVectors(norVectors, this.currTurtle.rotMat); //change to inverse transpose
   
              //create new leaf at that new center point
              var newCenter = vec3.create();
              vec3.add(newCenter, this.currTurtle.currPos, vec3.fromValues(0, 0, 0));
              var newLeaf = this.createLeaf(newCenter);

  
              newLeaf.positions = TurtleParser.Vec4toVBO(posVectors);
              newLeaf.normals = TurtleParser.Vec4toVBO(norVectors);

  
              //shift positions of default leaf so new leaf is at correct offset
              newLeaf = this.shiftLeaf(newCenter, newLeaf);
              newLeaf.create();
              //actually draw leaf
              meshDrawable = meshDrawable.addMeshComponent(newLeaf);
        }
        return meshDrawable;

    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(head: CharNode, meshDrawable: Mesh) {
        var currentNode;
        for(currentNode = head; currentNode != null; currentNode = currentNode.next) {
            meshDrawable = this.renderSymbol(currentNode, meshDrawable);
        }
        return meshDrawable;
    }

};
export default TurtleParser;
