class CharNode {
    char : string;
    next: CharNode;
    prev: CharNode;

    constructor (str : string) {
        this.char = str;
      
    }

    static stringToLinkedList(input_string: string) {
        var head = new CharNode(input_string[0]);
        var curr = head;
    
        for(var i = 1; i < input_string.length; i++) {
            var currChar = input_string.charAt(i);
            CharNode.linkNodes(curr, new CharNode(currChar));
            curr = curr.next;
        }
        return head;
    }
    
    static linkedListToString(head: CharNode) {
        var result = "";
        for(var curr = head; curr != null; curr = curr.next) {
            var currChar = curr.char;
            result = result + currChar;
        }
        return result;
    }

    static linkNodes(first: CharNode, second: CharNode) {
        if(first != null) {
            first.next = second;
        }
        if(second != null) {
            second.prev = first;
        }
    }

};
export default CharNode;