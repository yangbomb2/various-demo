/*
  Quick demo for image + text mapping
 */

//  scss
import 'StyleRoot/component/image-text.scss';
import 'StyleRoot/component/colorpicker.scss';

// preload images
import imageSrc0 from 'AssetRoot/image/headshot0.jpg';
import imageSrc1 from 'AssetRoot/image/headshot1.jpg';
import imageSrc2 from 'AssetRoot/image/headshot2.jpg';
import imageSrc3 from 'AssetRoot/image/headshot3.jpg';
import imageSrc4 from 'AssetRoot/image/headshot4.jpg';

// dependencies
import ColorPicker from 'simple-color-picker';
import _ from 'lodash';
import { imageLoader } from '../util';

const imageContainer = document.querySelector('#image-container');
const canvasContainer = document.querySelector('#canvas-container');

// vars
let baseCanvas;
let baseCtx;
let textCanvas;
let textCtx;
let srcImage;
let defaultBgColor = document.getElementById('bg-color').value;
let defaultFontSize = document.getElementById('font-size').value;

// TODO, to json
let origText = 'Lorem Ipsum mbled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';
let text = 'Lorem Ipsum mbled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';

// font option
const appOption = {
  allCap: true,// uppercase || lowercase
  fontSize: defaultFontSize,
  fontFamily: 'Arial',
  fontColor: defaultBgColor,
  bgColor: '#333',
  repeatText: false,
  blendMode: 'source-atop', // defalut
};

const measureText = (font) => {

  const dummy = document.createElement('canvas').getContext('2d');
  dummy.font = font;

  return (text) => dummy.measureText(text);

}

const draw = (srcImage) => {

  if (!srcImage) return;

  const srcWidth = srcImage.width;
  const srcHeight = srcImage.height;

  baseCanvas.width =  srcWidth;
  baseCanvas.height =  srcHeight;

  // font options(some of these should be from UI)
  const allCap = appOption.allCap; // uppercase || lowercase
  const fontSize = parseInt(appOption.fontSize, 10) || 20;
  const lingHeight = fontSize * 1;
  const fontFamily = appOption.fontFamily || 'Arial';
  const fontColor = appOption.fontColor || '#fff';
  const bgColor = appOption.bgColor || '#333';
  const font = `${fontSize}px ${fontFamily}`;
  const repeatText = appOption.repeatText;

  // text cap
  text = allCap ? text.toUpperCase() : text.toLowerCase();
  text = text.trim();

  // for pre measurement
  // approximate total line length to fill the whole image
  const minLineLength = Math.ceil(srcHeight/fontSize);

  let metrix;
  let lineLength;

  const caculateMetrix = () => {

    metrix = measureText(font)(text);

    lineLength = Math.ceil(metrix.width/srcWidth);

    if (lineLength < minLineLength) {

      text +=  text;

      caculateMetrix();

    }

  };

  caculateMetrix();

  // set text cavnas based on metrix
  textCanvas.width = Math.round(metrix.width);
  textCanvas.height = lingHeight;

  // color bg(canvas bg)
  canvasContainer.style.backgroundColor = bgColor;

  // draw text
  textCtx.font = font;
  textCtx.fillStyle = fontColor;
  textCtx.textAlign = 'start';
  textCtx.textBaseline = 'top';
  textCtx.fillText(text,0,0);

  // draw each row(line) of text cavnas onto base cavnas
  // get each iamge data per line
  for (let i = 0; i < minLineLength; i++) {

    const imageData = textCtx.getImageData(srcWidth * (i % lineLength), 0, srcWidth, lingHeight);
    baseCtx.putImageData(imageData, 0, i * lingHeight);

  }

  // draw image src under
  baseCtx.save();
  baseCtx.globalCompositeOperation = appOption.blendMode;
  baseCtx.drawImage(srcImage, 0, 0, srcWidth, srcHeight);
  baseCtx.restore();

}

const reset = () => {

  text = origText;

  if (baseCtx) baseCtx.clearRect(0,0, baseCanvas.width, baseCanvas.height);
  if (textCtx) textCtx.clearRect(0,0, textCanvas.width, textCanvas.height);

}

/**
 * Resize
 */
const resize = (e) => {

  if (srcImage) {

    reset();
    draw(srcImage);

  }

}

/**
 * UI Handler
 */
const uiHandler = (e) => {

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
    // do nothing
  }

  reset();

  draw(srcImage);

}

/**
 * Image load
 */
const load = (imageUrl) => {

  // image load
  imageLoader(imageUrl)
    .then((response) => {

      const { image, type } = response;

      if(!image.classList.contains('base-image')) image.classList.add('base-image');

      srcImage = image;

      imageContainer.innerHTML = '';
      imageContainer.appendChild(srcImage);

      setTimeout(draw, 500, image);

    })
    .catch((e) => console.log(e));

}

// TODO, use event delegation
const initUI = () => {

  Array.prototype.slice.call(document.getElementsByClassName('btn')).forEach((btn,i) => {

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

    const input = uiInput.getElementsByTagName('INPUT')[0];

    if (input.type === 'number' || input.type === 'text') {

      input.addEventListener('input', uiHandler, false);

    }

    if (input.type === 'checkbox' || input.type === 'radio') {

      input.addEventListener('change', uiHandler, false);

    }

  });

  document.getElementById('image-select').addEventListener('change', (e) => {

    const { options, selectedIndex } = e.target;

    load(options[selectedIndex].value);

  });

  document.getElementById('blend-mode').addEventListener('change', (e) => {

    const { options, selectedIndex } = e.target;

    appOption.blendMode = options[selectedIndex].value;

    reset();
    draw(srcImage);

  });

  // color pikcer
  const colorPicker = new ColorPicker({
    el: document.querySelector('.color-picker'),
    color: defaultBgColor,
    background: '#fff',
  });

  // color picker
  colorPicker.onChange((hexStringColor) => {

    document.getElementById('bg-color').value = hexStringColor;

    appOption.bgColor = hexStringColor;

    reset();
    draw(srcImage);

  });

}

export default {

  init: (data) => {

    // canvas
    baseCanvas = document.createElement('canvas');
    baseCanvas.className = 'base-canvas';
    baseCtx = baseCanvas.getContext('2d');
    canvasContainer.appendChild(baseCanvas);

    // text canvas to get the length/row image data
    textCanvas = document.createElement('canvas');
    textCanvas.className = 'text-canvas';
    textCtx = textCanvas.getContext('2d');
    canvasContainer.appendChild(textCanvas);

    initUI();

    // load first image
    load(document.getElementById('image-select').options[0].value);

    // resize
    window.addEventListener('resize', _.debounce(resize, 300));

  },

};
