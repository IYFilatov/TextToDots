import {default as glConst} from './constants.js';

export default class Screen {
  constructor(canvas, context) {
    Object.assign(this, { canvas, ctx: context });
    this.oldTimeStamp = null;
    this.width = canvas.width;
    this.height = canvas.height;
    this.initBufCanvas();
    this.textToArrCached = this.textToDotsArrCached();    
    this.drawingObj = [];
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
    // if (addFlag && this.drawingObj) {
    //   text = this.drawingObj.id + text;
    // };    

    let ObjArr = this.textToArrCached(text);
    ObjArr.setTime = Date.now();
    ObjArr?.arrData?.map((v) => { 
      v.startTime = ObjArr.setTime;
      v.x = v.defX;
      v.y = v.defY;
      v.sx = v.defX;
      v.sy = v.defY;
      v.speed = Math.random()*30 + 1;
      v.angle = (Math.random()*360)*Math.PI/180;
      v.tick = -0.5;      
    });

    if (addFlag && this.drawingObj) {
      if (this.countMappedDots() >= glConst.maxPoints){
        this.drawingObj.splice(0, 1);
      }

      if (!this.drawingObj.some(v => v.id === ObjArr.id)){
        this.drawingObj.push(ObjArr);
      } 
      
    } else {
      this.drawingObj = [ObjArr];
    }

  }

  countMappedDots() {
    let dotsAmount = 0;

    this.drawingObj.forEach(v=>{
      dotsAmount+=v.arrData.length;
    });    
    return dotsAmount;
  }

  clearScreen() {
    // this.ctx.clearRect(0, 0, this.width, this.height);
    // this.bufCtx.clearRect(0, 0, this.width, this.height);
    //this.bufCtx.fillStyle = "#FFFFFF";
    this.bufCtx.fillStyle = "#000000";
    this.bufCtx.fillRect(0, 0, this.width, this.height);
  }

  draw() {
    this.drawingObj.forEach(v=>{
      this.drawDots(v);      
    });    
  }

  drawDots(arrObj) {
    if (glConst.dotSize > 1) {
      arrObj?.arrData?.forEach((v) => {
        this.calculateDotPosition(v); 
        this.drawPixelWithRect(v.x, v.y, {
          r: v.rgb[0],
          g: v.rgb[1],
          b: v.rgb[2],
          a: 255,
        });
      });
    } else {
      let img = this.bufCtx.getImageData(0, 0, this.width, this.height);
      let imgData = img.data;

      arrObj?.arrData?.forEach((v) => {
        this.calculateDotPosition(v);
        this.drawPixel(imgData, v.x, v.y, {
          r: v.rgb[0],
          g: v.rgb[1],
          b: v.rgb[2],
          a: 255,
        });
      });
      this.bufCtx.putImageData(img, 0, 0);
    }
  }

  calculateDotPosition(dot){    
    dot.tick += glConst.precision;
    dot.x = dot.speed * Math.cos(dot.angle) * dot.tick + dot.sx;
    dot.y = (dot.speed * Math.sin(dot.angle) * dot.tick + glConst.g * (dot.tick*dot.tick)/2) + dot.sy;
    dot.rgb = [255, 255 - Math.trunc(255/this.height*dot.y), 0];
    
    //bounce from canvas bottom
    if (dot.y >= this.height) {
      dot.tick -= glConst.precision;
      let px = dot.speed * Math.cos(dot.angle) * dot.tick + dot.sx;
      let py = (dot.speed * Math.sin(dot.angle) * dot.tick + glConst.g * (dot.tick*dot.tick)/2) + dot.sy;
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
      dot.sx = px;
      dot.sy = py;
      dot.speed = dot.speed / 2;
    }

    //on dot stop or leave screen
    if (dot.speed < glConst.precision || dot.x < 0 || dot.x > this.width){
      dot.x = this.width / 2;
      dot.y = this.height;
      dot.sx = dot.x;
      dot.sy = dot.y;
      dot.angle = ((Math.random()*200) / 10 + 260) * Math.PI / 180;
      dot.tick = 0;
      dot.speed = Math.random()*50 + 50;
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
    this.bufCtx.fillRect(x, y, glConst.dotSize, glConst.dotSize);
  }

  drawStat(timeStamp) {
    // Calculate fps
    let secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
    this.oldTimeStamp = timeStamp;
    let fps = Math.round(1 / secondsPassed);

    // Draw FPS
    this.bufCtx.font = "11px Arial";
    this.bufCtx.fillStyle = "lime";
    this.bufCtx.fillText(`FPS: ${fps}`, 5, 11);

    //calculate Dots
    let dots = this.drawingObj.reduce((acc, v) => {
      return acc += v?.arrData.length;
    }, 0);

    // Draw dots count
    this.bufCtx.fillText(`dots: ${dots}`, 5, 25);
    

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
    let textFont = "16px Arial"; //16px Ubuntu Mono"
    let bufCanvas = document.createElement("canvas");
    bufCanvas.height = 20;
    
    let bufCtx = bufCanvas.getContext("2d");
    bufCtx.font = textFont;
    let scanWidth = bufCtx.measureText(text).width;
    
    bufCanvas.width = Math.trunc(scanWidth) + 1;
    
    // //debug{
    //   bufCtx.fillStyle = 'rgb(100, 100, 100)';
    //   bufCtx.fillRect(0, 0, bufCanvas.width, bufCanvas.height);
    // //}
    
    bufCtx.font = textFont;
    bufCtx.fillStyle = 'rgb(255, 0, 0)';
    bufCtx.fillText(text, 0, 15, scanWidth);

    let pdata, ind;
    let resObj = {
      id: text,
      arrData: []
    };
    let imgData = bufCtx.getImageData(0, 0, bufCanvas.width-1, bufCanvas.height-1).data;
    for (let x = 0; x < bufCanvas.width-1; x++) {
      for (let y = 0; y < bufCanvas.height-1; y++) {
        ind = 4 * ((bufCanvas.width-1) * y + x);
        pdata = [imgData[ind + 0], imgData[ind + 1], imgData[ind + 2], imgData[ind + 3]]
        if (pdata[3] !== 0) {
          this.addDotsBlock(resObj, x, y, pdata, glConst.textResize, bufCanvas);
        }
      }
    }

    return resObj;
  }

  addDotsBlock(resObj, x, y, pdata, multiplyAt, bufCanvas){
    let xCenter = this.width/2  - bufCanvas.width*glConst.dotSize*multiplyAt/2;
    let yCenter = this.height/2 - bufCanvas.height*glConst.dotSize*multiplyAt/2;

    for (let multPosX = 0; multPosX < multiplyAt; multPosX++){
      for (let multPosY = 0; multPosY < multiplyAt; multPosY++){
        resObj.arrData.push({
          x: x*glConst.dotSize*multiplyAt+(multPosX*glConst.dotSize) + xCenter,
          defX: x*glConst.dotSize*multiplyAt+(multPosX*glConst.dotSize) + xCenter,
          y: y*glConst.dotSize*multiplyAt+multPosY*glConst.dotSize + yCenter,
          defY: y*glConst.dotSize*multiplyAt+multPosY*glConst.dotSize + yCenter,
          rgb: [pdata[0], pdata[1], pdata[2]],
          defRGB: [pdata[0], pdata[1], pdata[2]],
          hex: "#" + ("000000" + this.rgbToHex(pdata[0], pdata[1], pdata[2])).slice(-6),
        });
      }
    }    
  }

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}
