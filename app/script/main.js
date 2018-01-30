/*
  Entry(Main)
 */

// polyfills(babel-polyfill is in webpack config)
import 'es6-promise';
import 'isomorphic-fetch';
import _ from 'lodash';
// import Modernizr from 'modernizr';

// custom polyfills
// ...

// bootstrap
// https://getbootstrap.com/docs/4.0/getting-started/webpack/
import 'bootstrap';

// inject index style
import 'StyleRoot/style.scss'; // generic styles(not module specific)

import browser from 'browser-detect';

// each project
import imageText from './component/image-text';

// render dom
const { name, versionNumber } = browser();
const browserVer = `${name}-${parseInt(versionNumber, 10)}`.toLowerCase();
document.body.classList.add(browserVer);

const APP_DATA = {
  name: 'Image processing + text', // name of the project
};

// (function(appData){
//
//   console.log(appData);
//
// })(APP_DATA);

window.addEventListener('DOMContentLoaded', (e) => {

  // image + text
  imageText.init(APP_DATA);

});

// Webpack Hot Module Replacement API
if (module.hot) {

  module.hot.accept();

}
