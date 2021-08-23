import {default as Screen} from './screen.js';

let stopFlag = true;
let mainCanvas;

function init() {
  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  const input = document.getElementById('ttc');
  input.addEventListener('input', updateText);
  
  mainCanvas = new Screen(canvas, context);

  //window.requestAnimationFrame(drawloop);
}

function updateText(e) {
  let inpValue = e.target.value.trim();
  if (inpValue){
    mainCanvas.setDrawingObj(inpValue.charAt(inpValue.length-1), true);
    start();
  }  
}

function drawloop(timeStamp) {
  mainCanvas.clearScreen();
  mainCanvas.draw();
  mainCanvas.drawFPS(timeStamp);

  mainCanvas.output();

  if (!stopFlag){
    window.requestAnimationFrame(drawloop);
  }
}

function startStop() {
  switch(stopFlag){
    case true:
      start();
      break;
    case false:
      stop();
      break;
  }
}

function start() {
  if (stopFlag) {
    let stBtn = document.getElementById("stBtn");
    stBtn.innerText = "Stop";
    stopFlag = false;

    const input = document.getElementById('ttc');
    if (!input.value.trim()){
      mainCanvas.setDrawingObj('Abrader', false);
    }

    window.requestAnimationFrame(drawloop);
  }
}

function stop() {
  if (!stopFlag) {
    let stBtn = document.getElementById("stBtn");
    stBtn.innerText = "Start";
    stopFlag = true;
  }
}

window.startStop = startStop;
window.onload = init;