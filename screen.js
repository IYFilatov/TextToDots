import {default as glConst} from './constants.js';

export default class Screen {
  constructor(canvas, context) {
    Object.assign(this, { canvas, ctx: context });
    this.oldTimeStamp = null;
    this.width = canvas.width;
    this.height = canvas.height;
    this.initBufCanvas();
    this.textToArrCached = this.textToDotsArrCached();    
  }

  initBufCanvas() {
    let bufCanvas = document.createElement("canvas");
    bufCanvas.width = this.width;
    bufCanvas.height = this.height;
    let bufCtx = bufCanvas.getContext("2d");

    this.bufCanvas = bufCanvas;
    this.bufCtx = bufCtx;
  }

  setDrawingObj(text = "Abrader", addFlag = false) {
    if (addFlag && this.drawingObj) {
      text = this.drawingObj.id + text;
    };

    let ObjArr = this.textToArrCached(text);
    this.drawingObj = ObjArr;
    this.drawingObj.setTime = Date.now();
    this.drawingObj?.arrData?.map((v) => { 
      v.startTime = this.drawingObj.setTime;
      v.x = v.defX;
      v.y = v.defY;
      v.tick = 0;
    });
  }

  clearScreen() {
    // this.ctx.clearRect(0, 0, this.width, this.height);
    // this.bufCtx.clearRect(0, 0, this.width, this.height);
    this.bufCtx.fillStyle = "#FFFFFF";
    this.bufCtx.fillRect(0, 0, this.width, this.height);
  }

  draw() {
    this.drawDots(this.drawingObj);
  }

  drawDots(arrObj) {
    // let img = this.bufCtx.getImageData(0, 0, this.width, this.height);
    // let imgData = img.data;

    // arrObj?.arrData?.forEach((v) => {
    //   this.calculateDotPosition(v);
    //   this.drawPixel(imgData, v.x, v.y, {
    //     r: v.rgb[0],
    //     g: v.rgb[1],
    //     b: v.rgb[2],
    //     a: 255,
    //   });
    // });
    // this.bufCtx.putImageData(img, 0, 0);

    arrObj?.arrData?.forEach((v) => {
      this.calculateDotPosition(v);
      this.drawPixelWithRect(v.x, v.y, {
        r: v.rgb[0],
        g: v.rgb[1],
        b: v.rgb[2],
        a: 255,
      });
    });

  }

  calculateDotPosition(dot){    
    dot.tick += glConst.precision;
    dot.x = dot.speed * Math.cos(dot.angle) * dot.tick + dot.defX;
    dot.y = (dot.speed * Math.sin(dot.angle) * dot.tick + glConst.g * (dot.tick*dot.tick)/2) + dot.defY;
    dot.rgb = [255, 255 - Math.trunc(255/this.height*dot.y), 0];
    
    //bounce from canvas bottom
    if (dot.y >= this.height) {
      dot.tick -= glConst.precision;
      let px = dot.speed * Math.cos(dot.angle) * dot.tick + dot.defX;
      let py = (dot.speed * Math.sin(dot.angle) * dot.tick + glConst.g * (dot.tick*dot.tick)/2) + dot.defY;
      //detect angle between dots
      let a = 90;
      
      if (dot.x - px != 0){
       a = Math.atan(Math.abs(dot.y - py) / Math.abs(dot.x - px)) / Math.PI * 180;
      }
      if (dot.x > px && dot.y >= py) { a = a; } //Righ-Down
      if (dot.x <= px && dot.y > py) { a = 180 - a; } //Left-Down
      if (dot.x < px && dot.y <= py) { a = a + 180; } //Left-Up
      if (dot.x >= px && dot.y < py) { a = 360-a; } //Right-Up

      dot.angle = (-a) * Math.PI / 180;
      dot.tick = 0;
      dot.x = px;
      dot.y = py;
      dot.speed = dot.speed / 2;
    }

    //on dot stop or leave screen
    if (dot.speed < glConst.precision || dot.x < 0 || dot.x > this.width){
      dot.x = this.width / 2;
      dot.y = this.height;
      dot.angle = ((Math.random()*200) / 10 + 260) * Math.PI / 180;
      dot.tick = 0;
      dot.speed = Math.random()*50 + 10;
      dot.rgb = dot.defRGB;
    }
  }
  
  drawPixel(imgData, x, y, color) {
    let rndX = Math.round(x);
    let rndY = Math.round(y);
    let ind = 4 * (this.width * rndY + rndX);

    imgData[ind + 0] = color.r;
    imgData[ind + 1] = color.g;
    imgData[ind + 2] = color.b;
    imgData[ind + 3] = color.a;
  }

  drawPixelWithRect(x, y, color) {
    this.bufCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    this.bufCtx.fillRect(x, y, 2, 2);
  }

  drawFPS(timeStamp) {
    // Calculate the number of seconds passed since the last frame
    let secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
    this.oldTimeStamp = timeStamp;

    // Calculate fps
    let fps = Math.round(1 / secondsPassed);

    // Draw number to the screen
    this.bufCtx.font = "25px Arial";
    this.bufCtx.fillStyle = "black";
    this.bufCtx.fillText("FPS: " + fps, 10, 30);
  }

  output() {
    this.ctx.drawImage(this.bufCanvas, 0, 0);
  }  

  textToDotsArrCached(){
    let cache = {};

    return (text) => {
      let result;

      if (cache.hasOwnProperty(text)) {
        result = cache[text];
      } else {
        result = this.textToDotsArr(text);
        cache[text] = result;
      }

      return result;
    };
  }

  textToDotsArr(text) {
    let bufCanvas = document.createElement("canvas");
    let scanWidth = Math.min(text?.length*50, 150);
    scanWidth = Math.max(scanWidth, 50);
    

    bufCanvas.width = scanWidth;
    bufCanvas.height = 50;
    let bufCtx = bufCanvas.getContext("2d");

    bufCtx.font = "60px Arial";
    bufCtx.fillStyle = 'rgb(255, 0, 0)';
    bufCtx.fillText(text, 0, 50, scanWidth);

    let xCenter = this.width / 2  - scanWidth / 2;
    let yCenter = 275;
    let pdata;
    let resObj = {
      id: text,
      arrData: [],
    };
    for (let x = 0; x < this.width; x+=2) {
      for (let y = 0; y < this.height; y+=2) {
        pdata = bufCtx.getImageData(x, y, 1, 1).data;
        if (pdata[3] !== 0) {
          //&& pdata[0] + pdata[1] + pdata[2] === 0 ){
          resObj.arrData.push({
            x: x+xCenter, 
            defX: x+xCenter,
            y: y+yCenter,
            defY: y+yCenter,
            tick: 0,
            speed: Math.random()*50 + 10,
            angle: (Math.random()*360)*Math.PI/180,
            rgb: [pdata[0], pdata[1], pdata[2]],
            defRGB: [pdata[0], pdata[1], pdata[2]],
            //rgb: [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)],
            hex:
              "#" +
              ("000000" + this.rgbToHex(pdata[0], pdata[1], pdata[2])).slice(
                -6
              ),
          });
        }
      }
    }

    return resObj;
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}
