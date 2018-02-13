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
// uncomment this per each project

// Image + Text
// import imageText from './component/image-text';

// Canvas Particle
import cavnasParticle from './component/canvas-particle';


// render dom
const { name, versionNumber } = browser();
const browserVer = `${name}-${parseInt(versionNumber, 10)}`.toLowerCase();
document.body.classList.add(browserVer);

const rootEl = document.getElementById('app-root');
const data = rootEl.dataset;

const APP_DATA = Object.assign({
	el: rootEl,
}, data);

// (function(appData){
//
//   console.log(appData);
//
// })(APP_DATA);

window.addEventListener('DOMContentLoaded', (e) => {

	// console.log(APP_DATA);
	// image + text
	// imageText.init(APP_DATA);
	// canvas particle
	cavnasParticle.init(APP_DATA);

});

// Webpack Hot Module Replacement API
if (module.hot) {

	// module.hot.accept('./component/canvas-particle');

}
