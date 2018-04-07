import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

  
class ExpansionRule {
  probability : number;
  expanded : string;
  
  constructor (prob : number, str : string) {
    this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
    this.expanded = str; // The string that will replace the char that maps to this Rule
  } 

};
  
  export default ExpansionRule;
  