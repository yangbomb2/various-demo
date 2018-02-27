/*
  Canvas Particle Index
  @author min yang
*/

// style
import style from 'StyleRoot/component/canvas-particle.scss';

// dependencies
import _ from 'lodash';
import Hammer from 'hammerjs';

import Particle from './particle';
import Boid from './boid';

// https://konvajs.github.io/docs/
import Konva from 'konva';

// bootstrap slider
import BootstrapSlider from 'bootstrap-slider';

// import behaviors
import {
	spring,
	collision,
	simpleRotation,
	pushPull,
	simpleOrbit,
	lineBetween,
	shoaling,
	boundaryCheck,
	grid,
} from '../behavior';

// particle related
const PARTICLE_COLOR = '33,33,33';
const PARTICLE_COLLIDE_COLOR = '241,0,0';
const BG_COLOR = 'rgba(251,251,251,1)';
// particle related ends

// refs
const canvasContainer = document.getElementsByClassName('canvas-container')[0];
let canvas;
let ctx;

// set width & height
let PARTICLE_LENGTH = 100; // 250
let PARTICLE_RADIUS = 2; // 3
let PARTICLE_MIN_DIST = 50; // see json for min value
let MAGNITUDE = 0; // see json for min value

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let particles = [];

// mouse related
let useMousePosition = false;
let mousePosition = {
	x: 0,
	y: 0,
};
let boundary = {
	left: 0,
	right: WIDTH,
	top: 0,
	bottom: HEIGHT,
};

let center = {x : 0, y: 0};

let mousePressInterval;
let mousePressElapsed = 0;
let mousePressed = false;

// animation frame
let requestAF;
let currentBehavior = '';
let isOkToApplyBehavior = false;

// ui
let activeUIs = [];
let UI = [];

// konva
let konvaStage;
let konvaLayer;

// factory fn
const createUIGroup = (uiGroup, i) => {

	const name = uiGroup.name;
	const children = uiGroup.children;

	const childrenHTML = children.reduce((all, ui, j) => {

		const { id, type, value, label, disabled, active } = ui;

		const renderedUI = `
		<div class="form-check">
			<input class="form-check-input" type="${type}" name="${name}" id="${name}-${j}" value="${value}" ${disabled ? 'disabled' : ''} ${active ? 'checked' : ''}>
			<label class="form-check-label" for="${name}-${j}">
			${label}
			</label>
		</div>`;

		all += renderedUI.trim();

		return all;

	}, '');

	const group = `
		<fieldset class="form-group">
			<legend class="col-form-label col-sm-2">${name}</legend>
			${childrenHTML}
		</fieldset>
	`.trim();

	return group;

}

const reset = () => {

	if (ctx) ctx.globalAlpha = 1;

}

/**
 *  Create Particles or Konva Objects
 */

// get grid unit per particle
const getGridPosition = (col, row, w, h, i) => {

	return {
		x: i % col,
		y: Math.floor(i / col),
		w,
		h,
	}

}

const createParticle = (particleLength, particleRadius) => {

	const { particle: { length, radius, randomSize, grid } } = activeUIs;
	const { top, right, bottom, left } = boundary;

	// reset
	PARTICLE_LENGTH = particleLength ? particleLength : length;
	PARTICLE_RADIUS = particleRadius ? particleRadius : radius;
	particles = [];

	// when grid
	if (currentBehavior === 'grid') PARTICLE_LENGTH = (grid.col + 1) * (grid.row + 1);

	// Particle base class
	const Class = currentBehavior !== 'shoaling' ? Particle : Boid;

	// 1 ~ PARTICLE_RADIUS
	const maxSize = PARTICLE_RADIUS;
	const minSize = 1;

	if (activeUIs.useKonva) {

		// grid
		if (currentBehavior === 'grid') {

			// get row based on fixed col
			// each grid unit
			const layer = new Konva.Layer();
			const nodeGroup = new Konva.Group();

			layer.add(nodeGroup);

			let node;
			for (let i = 0; i < PARTICLE_LENGTH; i++) {

				// grid x, y
				if (i === 0) {

					node = new Konva.Circle({
						name: 'node',
						x: 0,
						y: 0,
						radius: PARTICLE_RADIUS,
						fill: PARTICLE_COLOR,
						draggable: true,
					});

				} else {

					// clone
					node = node.clone({
						x: 0,
						y: 0,
					});

				}

				node.dragging = false;
				nodeGroup.add(node);

			}

			konvaStage.add(layer);

			// konvaStage.on('dragmove', (e) => {
			// });

			// konvaStage.on('dragend', (e) => {
			// });

			// konvaStage.on('dragmove', (e) => {
			// });

		}

	} else {

		// create particles
		for (let i = 0; i < PARTICLE_LENGTH; ++i) {

			const size = randomSize ? Math.floor(Math.random() * (maxSize - minSize + 1) + minSize) : PARTICLE_RADIUS;

			// get row based on fixed col
			// grid x, y
			const gridPosition = grid ? getGridPosition(grid.col + 1, grid.row + 1, Math.round(WIDTH / grid.col), Math.round(HEIGHT / grid.row), i) : void 0;

			// initial vector x, y
			const min = 5;
			const max = 10;
			const vec = Math.floor(Math.random() * (max - min + 1)) + min;
			const vx = (Math.random() - .5) * vec; // -vec ~ vec
			const vy = (Math.random() - .5) * vec; // -vec ~ vec
			const x = grid ? (gridPosition.x * gridPosition.w) : Math.random() * WIDTH;
			const y = grid ? (gridPosition.y * gridPosition.h) : Math.random() * HEIGHT;

			const particle = new Class({
				id: i,
				ctx,
				x,
				y,
				w: WIDTH,
				h: HEIGHT,
				vx,
				vy,
				r: size,
				mass: size,
				defaultColor: PARTICLE_COLOR,
				collideColor: PARTICLE_COLLIDE_COLOR,
				gridPosition,
			});

			particles.push(particle);

		}



	}

}

/**
 * Repaint the context(reset)
 */
const repaint = () => {

	if (ctx && !activeUIs.useKonva) {

		ctx.fillStyle = `${BG_COLOR}`;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

	}

}

/**
 * Slider change handler
 * @param {String} slider name
 * @param {Number} value
 */

let db;
const sliderChange = (slider, value) => {

	const { id } = slider.options;

	// console.log(id, value, slider.options);

	switch (id) {

	case 'line-length':

		PARTICLE_MIN_DIST = value;

		break;

	case 'population':

		// debounce
		clearTimeout(db);
		db = setTimeout(() => {

			if (isOkToApplyBehavior) {

				createParticle(PARTICLE_LENGTH, value);
				reset();

			}

		}, 300);

		break;

	case 'radius':

		// debounce
		clearTimeout(db);
		db = setTimeout(() => {

			if (isOkToApplyBehavior) {

				createParticle(PARTICLE_LENGTH, value);
				reset();

			}

		}, 300);

		break;

	case 'range':

		PARTICLE_MIN_DIST = value;

		break;

	case 'magnitude':

		MAGNITUDE = value;

		break;

	default:
		//
	}

}

let sliders = [];
const createSlider = () => {

	const container = document.getElementsByClassName('ui-sliders')[0];

	// destroy
	sliders.forEach(prevSlider => prevSlider.destroy());
	sliders = [];
	container.innerHTML = '';

	if (activeUIs.sliders) {

		activeUIs.sliders.forEach((sliderOption, i) => {

			// wrapper
			const wrapper = document.createElement('div');
			wrapper.className = 'slider-wrapper';

			// label
			const label = document.createElement('span');
			label.className = 'label';
			label.innerText = `${sliderOption.name}`;
			wrapper.appendChild(label);

			const el = document.createElement('div');
			const id = `slider-${i}`;
			el.id = id;
			wrapper.appendChild(el);

			container.appendChild(wrapper);

			// slider js
			const slider = new BootstrapSlider(`#${id}`, sliderOption);
			slider.on('slide', sliderChange.bind(null, slider));

			// TODO, opt this.
			((s) => {

				sliderChange(s, s.getValue());

			})(slider);

			sliders.push(slider);

		});

	}

	return;

}

const initCanvas = () => {

	if (activeUIs.useKonva) {

		if (konvaStage) {

			konvaStage.clear();
			konvaStage.destroyChildren();
			konvaStage.destroy();

		}

		// with konva
		konvaStage = new Konva.Stage({
			container: 'canvas-container',
			width: WIDTH,
			height: HEIGHT,
		});

		canvas = konvaStage.toCanvas();
		ctx = canvas.getContext('2d');

	} else {

		// vanila canvas
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');

		canvasContainer.innerHTML = '';
		canvasContainer.appendChild(canvas);

	}

}

/**
 * App
 */
const CanvasParticle = {

	init(data) {

		if (Object.prototype.hasOwnProperty.call(data, 'el')) this.el = data.el;

		// Form & UI
		const form = this.el.getElementsByTagName('form')[0];

		form.addEventListener('change', this.formChange.bind(this), false);
		window.addEventListener('resize', _.debounce(this.resize.bind(this), 300), false);

		// Hammer
		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Press());
		this.hammer.on('press pressup', this.mouseHandler.bind(this));

		// mouse events
		canvasContainer.addEventListener('mousedown', this.mouseHandler.bind(this), false);
		canvasContainer.addEventListener('mouseup', this.mouseHandler.bind(this), false);
		canvasContainer.addEventListener('mousemove', _.throttle(this.mouseHandler.bind(this), 150), false);

		// fetch json
		fetch(`${window.location.href}/asset/json/canvas-particle.json`)
			.then(res => res.json())
			.then(json => {

				// INFO
				const infoHTML = `
					<h1>${json.info.title}</h1>
					<p>${json.info.subTitle}</p>
					<p><a href="${json.info.link.href}" target="${json.info.link.linkTarget}">${json.info.link.linkLabel}</a></p>
					`.trim();

				this.el.getElementsByClassName('info')[0].innerHTML = infoHTML;

				// UI
				UI.push(json.ui);

				let uiHTML = '';
				UI.forEach((uiGroup, i) => uiHTML += createUIGroup(uiGroup, i));
				form.innerHTML = uiHTML;

				// default active
				this.setActiveUI();

			});

	},

	formChange(e) {

		const target = e.target;

		const targetUIGroup = UI.filter(uiGroup => uiGroup.name === target.name).pop();

		if (targetUIGroup && Object.prototype.hasOwnProperty.call(targetUIGroup, 'children')) {

			// if checkbox
			if (target.type === 'checkbox') {

				const targetUI = targetUIGroup.children.filter(ui => ui.value === target.value)[0];

				if (targetUI) targetUI.active = target.checked;

			}

			// if radio
			if (target.type === 'radio') {

				targetUIGroup.children.forEach(ui => {

					ui.active = ui.value === target.value;

				});

			}

		}

		this.setActiveUI();

	},

	setActiveUI() {

		cancelAnimationFrame(requestAF);

		// find which ui is active
		activeUIs = UI
			.reduce((activeUIs, uiGroup) => activeUIs.concat(uiGroup.children.filter(ui => ui.active)), [])
			.pop();


		// update alert
		this.el.getElementsByClassName('alert')[0].innerHTML = activeUIs.description;

		currentBehavior = activeUIs.value;

		console.log(`currentBehavior: ${currentBehavior} || `, 'activeUIs: ', activeUIs);

		const allBehaviors = UI[0].children.reduceRight((total, prev, i) => total.concat(prev.value), []);

		allBehaviors.forEach(b => this.el.classList.remove(b));
		this.el.classList.add(currentBehavior);


		// call chain
		isOkToApplyBehavior = false;

		initCanvas();

		// creat sliders
		createSlider();

		// creat particle
		createParticle();

		// position particles randomly
		reset();

		// start request animation frame
		requestAF = requestAnimationFrame(this.tick.bind(this));

		window.dispatchEvent(new Event('resize'));

		// dispatch resize
		setTimeout(() => {

			isOkToApplyBehavior = true;

		}, 500);

	},

	mouseHandler(e) {

		switch (e.type) {

		case 'mousemove':

			const box = e.target.getBoundingClientRect();
			mousePosition.x = e.clientX - box.left;
			mousePosition.y = e.clientY - box.top;

			break;

		case 'mousedown':
		case 'press':

			mousePressed = true;
			mousePressElapsed = window.performance.now();

			if (currentBehavior === 'push-and-pull') {

				for (let i = 0; i < particles.length; ++i) {

					particles[i].state.vx = 0;
					particles[i].state.vy = 0;

				}

			}

			break;

		case 'mouseup':
		case 'pressup':

			mousePressed = false;
			mousePressElapsed = window.performance.now() - mousePressElapsed;

			if (currentBehavior === 'push-and-pull') {

				// reset();

			}

			break;

		}


	},

	resize(e) {

		const { particle: { grid } } = activeUIs;

		// over 768
		const isLargeScreen = window.matchMedia('screen and (min-width: 768px)').matches;

		if (!isLargeScreen) {

			WIDTH = window.innerWidth;
			HEIGHT = 500;

		} else {

			const uiContainer = document.getElementsByClassName('ui-container')[0];

			// update
			WIDTH = window.innerWidth - uiContainer.offsetWidth;
			HEIGHT = window.innerHeight;

		}

		// boundary(wall)
		boundary = {
			left: 0,
			right: WIDTH,
			top: 0,
			bottom: HEIGHT,
		};

		// resize either canvas or konva stage
		if (activeUIs.useKonva) {

			konvaStage.setHeight(HEIGHT);
			konvaStage.setWidth(WIDTH);

		} else {

			canvas.width = WIDTH;
			canvas.height = HEIGHT;

		}

		// center
		center = { x: canvas.width * .5, y: canvas.height * .5 };

		// update normal particles
		for (let i = 0; i < particles.length; ++i) {

			const p = particles[i];

			if (!(p instanceof Particle)) continue;

			particles[i].state.w = WIDTH;
			particles[i].state.h = HEIGHT;
			particles[i].state.gridPosition = grid ? getGridPosition(grid.col + 1, grid.row + 1, Math.round(WIDTH / grid.col), Math.round(HEIGHT / grid.row), i) : void 0;

		}

	},

	render() {

		// proceed when ready
		if (!isOkToApplyBehavior) return;

		// repaint
		repaint();

		switch (currentBehavior) {

		case 'simple-collision':

			// n-between collision detection & bounce
			collision(particles, true);

			break;

		case 'collision':

			// n-between collision detection & bounce
			collision(particles, false);

			break;

		case 'simple-rotation':

			// simple rotation
			simpleRotation(particles, center, mousePressed);

			break;

		case 'push-and-pull':

			// push-and-pull
			pushPull(particles, mousePosition, mousePressed, ctx);

			break;

		case 'simple-orbit':

			// simple orbit
			simpleOrbit(particles, center);

			break;

		case 'line-between':

			// check in-between distance against neibors and draw line`
			lineBetween(particles, ctx, PARTICLE_MIN_DIST);

			break;

		case 'nodes':

			// nodes spring
			spring(particles, mousePosition, ctx, PARTICLE_COLOR);

			break;

		case 'shoaling':

			// simple shoaling
			shoaling(particles, center);

			break;

		case 'grid':

			// grid
			grid(particles, activeUIs.particle.grid, boundary, mousePosition, ctx, PARTICLE_MIN_DIST, MAGNITUDE);
			// gridKonva(konvaStage, activeUIs.particle.grid, boundary, mousePosition);

			break;

		default:
			//
		}

		// simple boundary check & bounce
		boundaryCheck(particles, boundary);


	},

	tick() {

		// do things
		this.render();

		requestAF = requestAnimationFrame(this.tick.bind(this));


	},

};

export default CanvasParticle;
