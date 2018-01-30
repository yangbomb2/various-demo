/*
  Quick demo for image mapping
  author: min
 */


import 'babel-polyfill';

//scss
import 'style/style.scss';
import 'style/colorpicker.scss';

//preload images
import imageSrc0 from 'asset/image/headshot0.jpg';
import imageSrc1 from 'asset/image/headshot1.jpg';
import imageSrc2 from 'asset/image/headshot2.jpg';
import imageSrc3 from 'asset/image/headshot3.jpg';
import imageSrc4 from 'asset/image/headshot4.jpg';

import imageLoader from 'script/component/imageLoader';
import ColorPicker from 'simple-color-picker';

let imageContainer = document.querySelector('#image-container'),
    canvasContainer = document.querySelector('#canvas-container'),
    baseCanvas,
    baseCtx,
    textCanvas,
    textCtx,
    srcImage,
    defaultBgColor = document.getElementById('bg-color').value,
    defaultFontSize = document.getElementById('font-size').value,
    origText="Lorem Ipsum mbled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    text="Lorem Ipsum mbled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";


//font option
let appOption = {
  allCap: true,//uppercase || lowercase
  fontSize: defaultFontSize,
  fontFamily: 'Arial',
  fontColor: defaultBgColor,
  bgColor: '#333',
  repeatText: false,
  blendMode: 'source-atop'//defalut
};

//color pikcer
let colorPicker = new ColorPicker({
  el: document.querySelector('.color-picker'),
  color: defaultBgColor,
  background: '#fff',
});

colorPicker.onChange(function(hexStringColor) {
  document.getElementById('bg-color').value = hexStringColor;

  appOption.bgColor = hexStringColor;
  reset();
  draw(srcImage);
});


function resize(e) {
  if(srcImage) {
    reset();
    if(srcImage) draw(srcImage);
  }
}

function load(srcImg) {

  //image load
  imageLoader(srcImg)
  .then((response) => {

    let img = new Image();
    img.src = response.src;
    img.className = 'base-image';
    srcImage = img;

    imageContainer.innerHTML = '';
    imageContainer.appendChild(img);


    draw(srcImage);

    resize();

  })
  .catch((e) => console.log(e));
}

function initUI(){
  Array.prototype.slice.call(document.querySelectorAll('.btn')).forEach((btn,i) => {

    btn.addEventListener('click', (e) => {
      switch(e.target.getAttribute('id')) {
        case 'clear':
          reset();
          break;

        case 'redraw':
          reset();
          draw(srcImage);
          break;
      }
    });
  });

  document.querySelectorAll('.ui-input').forEach((uiInput, i) => {
      let input = uiInput.getElementsByTagName('INPUT')[0];

      if(input.type === 'number' || input.type === 'text') {
        input.addEventListener('input', uiHandler, false);
      }

      if(input.type === 'checkbox' || input.type === 'radio') {
        input.addEventListener('change', uiHandler, false);
      }
  });

  document.getElementById('image-select').addEventListener('change', (e) => {
    let {options, selectedIndex} = e.target;
    load(options[selectedIndex].value);
  });

  document.getElementById('blend-mode').addEventListener('change', (e) => {
    let {options, selectedIndex} = e.target;
    // load(options[selectedIndex].value);
    appOption.blendMode = options[selectedIndex].value;

    reset();
    draw(srcImage);
  });
}

function uiHandler(e) {

  switch(e.target.id) {

    case 'font-size':
      appOption.fontSize = e.target.value;
    break;

    case 'bg-color':
      appOption.bgColor = e.target.value;
    break;

    case 'all-cap':
      appOption.allCap = e.target.checked;
    break;

    case 'repeat-text':
      appOption.repeatText = e.target.checked;
    break;

    default:
      //do nothing
  }

  reset();
  draw(srcImage);
}

function measureText(font) {
  let dummy = document.createElement('canvas').getContext('2d');
  dummy.font = font;
  return function(text) {return dummy.measureText(text); }
}

function reset() {
  text = origText;
  if(baseCtx) baseCtx.clearRect(0,0, baseCanvas.width, baseCanvas.height);
  if(baseCtx) textCtx.clearRect(0,0, textCanvas.width, textCanvas.height);
}

function draw(srcImage) {
  if(!srcImage) return;

  let srcWidth = srcImage.width,
      srcHeight = srcImage.height;

  baseCanvas.width= srcWidth;
  baseCanvas.height= srcHeight;

  // Object.keys(appOption).forEach((k, i) => console.log(k, ' ' , appOption[k]))

  //font options(some of these should be from UI)
  let allCap = appOption.allCap ,//uppercase || lowercase
      fontSize = parseInt(appOption.fontSize) || 20,
      lingHeight = fontSize * 1,
      fontFamily = appOption.fontFamily || 'Arial',
      fontColor = appOption.fontColor || '#fff',
      bgColor = appOption.bgColor || '#333',
      font = fontSize + 'px ' + fontFamily,
      repeatText = appOption.repeatText;

  //text cap
  text = allCap ? text.toUpperCase() : text.toLowerCase();
  text = text.trim();

  //for pre measurement
  //approximate total line length to fill the whole image
  let minLineLength = Math.ceil(srcHeight/fontSize),
      metrix,
      lineLength;

  let caculateMetrix = function() {

    metrix = measureText(font)(text);

    lineLength = Math.ceil(metrix.width/srcWidth);

    if(lineLength < minLineLength) {
      text += text;
      caculateMetrix();
    }
  };
  caculateMetrix();


  //set text cavnas based on metrix
  textCanvas.width = Math.round(metrix.width);
  textCanvas.height = lingHeight;

  //color bg(canvas bg)
  canvasContainer.style.backgroundColor = bgColor;

  //draw text
  textCtx.font = font;
  textCtx.fillStyle = fontColor;
  textCtx.textAlign = 'start';
  textCtx.textBaseline = 'top';
  textCtx.fillText(text,0,0);

  //draw each row(line) of text cavnas onto base cavnas
  //get each iamge data per line
  for(let i = 0; i < minLineLength; i++) {
    let imageData = textCtx.getImageData(srcWidth * (i % lineLength), 0, srcWidth, lingHeight);
    baseCtx.putImageData(imageData, 0, i * lingHeight);
  }

  //draw image src under
  baseCtx.save();
  baseCtx.globalCompositeOperation = appOption.blendMode;
  baseCtx.drawImage(srcImage, 0,0,srcWidth,srcHeight);
  baseCtx.restore();
}

window.addEventListener('DOMContentLoaded', (e)=>{
 //canvas
  baseCanvas = document.createElement('canvas');
  baseCanvas.className = 'base-canvas';
  baseCtx = baseCanvas.getContext('2d');
  canvasContainer.appendChild(baseCanvas);

  //text canvas to get the length/row image data
  textCanvas = document.createElement('canvas');
  textCanvas.className = 'text-canvas';
  textCtx = textCanvas.getContext('2d');
  canvasContainer.appendChild(textCanvas);

  initUI();

  //load first image
  load(document.getElementById('image-select').options[0].value);

  window.addEventListener('resize', resize);

  resize();
});
