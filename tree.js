/*
  Derivation Tree Generator - A syntax tree graph generator
  credit to 2019 Andre Eisenbach <andre@ironcreek.net>
  You can find the original repo here "https://github.com/int2str/jssyntaxtree/"
  I have added some comments to explain the process of generating derivation tree  
  Feel free to explore! (hkz)
  GLHF
*/

const PADDING = 15; // Padding between the nodes of the tree (increasing will make it wider)

import Canvas from './canvas.js';
import Node from './node.js';

function back(a) {
  return a.length === 0 ? -1 : a[a.length - 1];
}
/*
  get the lowest node of the tree
*/
function getLowestNode(nodes) {
  return nodes.reduce((accumulator, node) => node.level > accumulator ? node.level : accumulator, 0 /*initial level of the tree is zero*/); 
  // if current node level is greater than accumulator(total nodes level), lowestNodeLevel becomes current node level
}

export default class Tree {
  constructor() { 
    this.nodes = [];
    this.nodecolor = true;
    this.fontsize = 16;
    this.align_bottom = false;
    this.canvas = null;
  }

  draw() {
    this.canvas.clear();
    this.canvas.translate(0, this.fontsize / 2);

    for (let node of this.nodes) {
      // Draw node label in the appropriate color
      if (this.nodecolor) {
        //change color to red & blue (if it is leaf, the color is red, else blue)
        this.canvas.setFillStyle(node.leaf ? '#CC0000' : '#0000CC'); 
      } else {
        //change color to black
        this.canvas.setFillStyle('black'); 
      }

      // if align_bottom is checked, the terminal nodes will be at bottom, else it will shows at current node level
      let l = node.leaf && this.align_bottom ? getLowestNode(this.nodes) : node.level; 
      
      //write text on canvas (function call from canvas.js)
      this.canvas.text(
          node.value, node.offset + node.width / 2,
          l * this.fontsize * 3);

      if (node.p === -1) continue; //parent (top most node = -1)

      let p = this.nodes[node.p]; 
      console.log(node); // you can find details of node objects in console (this is for debugging - refresh to see changes )
      if (node.leaf && node.value.indexOf(' ') != -1) {
        this.canvas.line(
            p.offset + p.width / 2, p.level * this.fontsize * 3 + this.fontsize,
            node.offset + PADDING, l * this.fontsize * 3 - 5);
        this.canvas.line(
            p.offset + p.width / 2, p.level * this.fontsize * 3 + this.fontsize,
            node.offset + node.width - PADDING,
            l * this.fontsize * 3 - 5);
        this.canvas.line(
            node.offset + PADDING, l * this.fontsize * 3 - 5,
            node.offset + node.width - PADDING,
            l * this.fontsize * 3 - 5);
      } else {
        this.canvas.line(
            p.offset + p.width / 2, p.level * this.fontsize * 3 + this.fontsize,
            node.offset + node.width / 2, l * this.fontsize * 3 - 5);
      }
    }
  }

  setCanvas(c) {
    this.canvas = new Canvas(c);
  }

  setColor(e) {
    this.nodecolor = e;
  }

  setFont(f) {
    this.canvas.setFont(f);
  }

  setFontsize(s) {
    this.fontsize = parseInt(s, 10);
    this.canvas.setFontSize(this.fontsize);
  }


  setAlignBottom(a) {
    this.align_bottom = a;
  }

// parse the string input from textArea
  parseString(s) {
    const State = {IDLE: 0, LABEL: 1, VALUE: 2, APPENDING: 3, QUOTES: 5};

    let state = State.IDLE; //initial state 
    let idx = 0;
    let parents = [];
    this.nodes = [];
    //iterates to the length of string and check every single character c
    for (let c of s) {
      switch (c) {
        //if '[' is found, the state becomes label and it's pushed into parents
        case '[':
          this.nodes.push(new Node(back(parents), parents.length));
          parents.push(idx++);
          state = State.LABEL;
          break;

        //if ']' is found, the state becomes value and then it is poped out of parents and added to tree
        case ']':
          state = State.VALUE;
          parents.pop();
          break;

        //if whitespace is found, it doesn't count 
        case ' ':
          if (state != State.APPENDING && state != State.QUOTES) {
            state = State.APPENDING;
            this.nodes.push(new Node(back(parents), parents.length));
            ++idx;
            break;
          }
          // Fallthrough
        default:
          if (state === State.VALUE) {
            state = State.APPENDING;
            this.nodes.push(new Node(back(parents), parents.length));
            ++idx;
          }
          else {
            back(this.nodes).value += c;
          }
          console.log(parents);
          break;
      }
    }
  }

  calculateWidth() {

    this.canvas.setFontSize(this.fontsize);

    // Reset child width and calculate text width
    for (let node of this.nodes) {
      node.width = this.canvas.textWidth(node.value) + PADDING;
      node.child_width = 0;
    }

    // Calculate child width (iterates backwards)
    for (let j = this.nodes.length - 1; j != -1; --j) {
      if (this.nodes[j].child_width > this.nodes[j].width) {
        this.nodes[j].width = this.nodes[j].child_width;
      }

      if (this.nodes[j].p != -1) {
        this.nodes[this.nodes[j].p].child_width += this.nodes[j].width;
        this.nodes[this.nodes[j].p].leaf = false;
      }
    }

    /* 
      Fix node size if parent node is bigger than sum
      of children (iterates backwards)
    */
    for (let i = this.nodes.length - 1; i != -1; --i) {
      let node = this.nodes[i];
      if (node.leaf || node.width <= node.child_width) continue;
      for (let child of this.getChildren(i)) {
        this.nodes[child].width *= (node.width / node.child_width);
      }
    }

    // Calculate offsets
    let level_offset = [];
    for (let node of this.nodes) {
      if (level_offset.length < (node.level + 1)) level_offset.push(0);
      if (node.p != -1) {
      /*
        Take max value between offset and width of the node and sets as new offset 
        (offset of leftmost node of a level = 0) 
      */ 
        node.offset = Math.max(level_offset[node.level], this.nodes[node.p].offset); 

      } else {
        // if node.p == -1(which is parent node), then offset is set to 0 (∵ level of parent node is 0)
        node.offset = level_offset[node.level];
      }
      level_offset[node.level] = node.offset + node.width;
    }
  }
  // return children nodes 
  getChildren(p) {
    let children = [];
    for (let i = 0; i != this.nodes.length; ++i) {
      if (this.nodes[i].p === p) children.push(i);
    }
    return children;
  }
  // changing canvas size
  resizeCanvas() {
    let max_width = this.nodes.reduce(
        (acc, node) => (node.level === 0 ? acc + node.width : acc), 0);
    let max_level =
        this.nodes.reduce((acc, node) => Math.max(acc, node.level), 0);
    this.canvas.resize(
        max_width, (max_level + 1) * this.fontsize * 3 - this.fontsize);
  }

  //parse the input from textArea and refresh the canvas
  parse(s) {
    this.parseString(s);
    this.calculateWidth();
    this.resizeCanvas();
    this.draw();
  }

  download() {
    this.canvas.download('syntax_tree.png'); // File name as argument( If you wanna change file name, you can edit here)
  }
}
