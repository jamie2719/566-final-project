import ExpansionRule from './ExpansionRule';
import CharNode from './CharNode'


class LSystem {
    grammar : Map<string, Array<ExpansionRule>>;
    seed: string;
    iterations: number;

    constructor(seed: string, iter: number) {
        this.seed = seed;
        this.iterations = iter;
        this.grammar = new Map<string, Array<ExpansionRule>>();
        this.createGrammar();
    }


    createGrammar() {
        // this.grammar.set('F', new Array<ExpansionRule>(new ExpansionRule(.6, 'FL[+FL][-FL][RFL][EFL]'), new ExpansionRule(.4, 'FL[+FL]F[RFL]')));//new ExpansionRule(.6, 'F[-F][+F][RF]'), new ExpansionRule(.4, 'F[+F][-F][LF]')));
        // this.grammar.set('+', new Array<ExpansionRule>(new ExpansionRule(.7, '[FL]'), new ExpansionRule(.3, '[FFL]')));
        // this.grammar.set('-', new Array<ExpansionRule>(new ExpansionRule(.7, '-FRF'), new ExpansionRule(.3, '[RFF]')));
        // // this.grammar.set('R', new Array<ExpansionRule>(new ExpansionRule(.3, 'QF'), new ExpansionRule(.7, 'WF')));
        // // this.grammar.set('L', new Array<ExpansionRule>(new ExpansionRule(.3, 'BF'), new ExpansionRule(.7, 'VF')));
        // this.grammar.set(']', new Array<ExpansionRule>(new ExpansionRule(.4, '[+F]'), new ExpansionRule(.6, '[-F]')));
        // //this.grammar.set('[', new Array<ExpansionRule>(new ExpansionRule(1, '[[RF]')));

      
        this.grammar.set('F', new Array<ExpansionRule>(new ExpansionRule(.25, 'F[+FL][-.FL][*FL]'), 
                                                        new ExpansionRule(.5, 'F[+FL][-*FL][.FL]'),
                                                        new ExpansionRule(.5, 'F[+*FL][-.FL][.FL][*FL]')));

    }
//combinations of rotations
//probabilities dependent on height

    expandSeed() {
        
        var axiom = CharNode.stringToLinkedList(this.seed);
        var curr = axiom;
        //iterate through seed and for each char, look it up in the rulebook and replace the char with that entry
        for(curr; curr != null; curr = curr.next) {
            var oldNext = curr.next;
            var oldPrev = curr.prev;
            var currChar = curr.char;
            var expand = this.grammar.get(currChar); //set of expansion rules that map to this char

            //if there is an expanded string for this character in the grammar
            if(expand != null) {
                var expandedHead;
                //if there is more than one option for expanding with different probabilities
                if(expand.length != 1) {
                    //loop through and choose one at random
                    // for(var i = 0; i < expand.length; i++) {
                        var rand = Math.random();
                        //var currProb = expand[i].probability;
                        // if (rand < currProb) {
                        //     expandedHead = CharNode.stringToLinkedList(expand[i].expanded);
                        // }
                        // else {
                        //     expandedHead = CharNode.stringToLinkedList(expand[i+1].expanded);
                        // }
                        if(rand < .25) {
                            expandedHead = CharNode.stringToLinkedList(expand[0].expanded);
                        }
                        else if(rand < .5) {
                            expandedHead = CharNode.stringToLinkedList(expand[1].expanded);
                        }
                        else {
                            expandedHead = CharNode.stringToLinkedList(expand[2].expanded);
                        }
                        // else {
                        //     expandedHead = CharNode.stringToLinkedList(expand[3].expanded);
                        // }
                        
                    // }
                }
                //else choose the first and only option in the array of possibilities
                else {
                    expandedHead = CharNode.stringToLinkedList(expand[0].expanded);
                }
                //link old prev to head of expanded string
                CharNode.linkNodes(oldPrev, expandedHead);

                var expandedLast = expandedHead;
           
                while(expandedLast.next != null) {
                    expandedLast = expandedLast.next;
                }
                //link last of expanded string to old next
                CharNode.linkNodes(expandedLast, oldNext);
            
                curr = expandedLast;
            
            }
            //if you've reached the end of the input string, loop back to the head and return the head
            if(curr.next == null) {
                while(curr.prev != null) {
                    curr = curr.prev;
                }
                break;
            }
           
        }
        this.seed = CharNode.linkedListToString(curr);
    }

    doIterations() {
        for(var i = 0; i < this.iterations; i++) {
            this.expandSeed();
        }
    }
   
};
 export default LSystem;
