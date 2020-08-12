/*
  Derivation Tree Generator - A syntax tree graph generator
  credit to 2019 Andre Eisenbach <andre@ironcreek.net>
  You can find the original repo here "https://github.com/int2str/jssyntaxtree/"
  I have added some comments to explain the process of generating derivation tree  
  Feel free to explore! (hkz)
  GLHF
*/

export default class Canvas {
  constructor(c) {
    this.canvas = c;
    this.font = 'sans-serif';
    this.fontsize = 16;
    this.context = c.getContext('2d'); // creates object representing a two-dimensional rendering context.
  }
//change the size of canvas
  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
  }
//return text size
  textWidth(t) {
    this.context.font = this.fontsize + 'px ' + this.font;
    return this.context.measureText(t).width;
  }
//reset the canvas
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.textAlign = 'center';
    this.context.textBaseline = 'top';
  }

  translate(x, y) {
    this.context.translate(x, y);
  }
//add text to canvas
  text(text, x, y) {
    this.context.font = this.fontsize + 'px ' + this.font;
    this.context.fillText(text, x, y);
  }

  setFont(f) {
    this.font = f;
  }

  setFontSize(s) {
    this.fontsize = s;
  }

  setFillStyle(s) {
    this.context.fillStyle = s;
  }
//Draw links between nodes of the tree
  line(x1, y1, x2, y2) {
    let ctx = this.context;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
//download the image when clicked
  download(fileName) {
    let image = this.canvas.toDataURL('image/png') // returns a data URI containing a representation of the image in the format PNG. The returned image is in a resolution of 96 dpi.
                    .replace('image/png', 'image/octet-stream'); // If you dont replace you will get a DOM 18 exception.
    let link = document.getElementById('link');
    link.setAttribute('href', image); // get id of <a> in index.html
    link.setAttribute('download', fileName);
    link.click();
  }
}