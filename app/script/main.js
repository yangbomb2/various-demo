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

// inject index style
import 'StyleRoot/style.scss'; // generic styles(not module specific)

import browser from 'browser-detect';

// render dom
const { name, versionNumber } = browser();
const browserVer = `${name}-${parseInt(versionNumber, 10)}`.toLowerCase();
document.body.classList.add(browserVer);

const APP_DATA = {
  name: 'simple app2', // name of the project
};

// (function(appData){
//
//   console.log(appData);
//
// })(APP_DATA);

window.addEventListener('DOMContentLoaded', (e) => {

  console.log('== dom ready ==');


});

// Webpack Hot Module Replacement API
if (module.hot) {

  module.hot.accept();

}
