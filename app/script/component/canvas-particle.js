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

// bootstrap slider
import BootstrapSlider from 'bootstrap-slider';

// import behaviors
import { spring, simpleCollision, simpleRotation, pushPull, simpleOrbit, lineBetween, shoaling } from '../behavior';

// particle related
const PARTICLE_COLOR = '33,33,33';
const PARTICLE_COLLIDE_COLOR = '241,0,0';
const BG_COLOR = 'rgba(251,251,251,1)';
// particle related ends

// refs
const canvasContainer = document.getElementsByClassName('canvas-container')[0];
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

// set width & height
let PARTICLE_LENGTH = 100; // 250
let PARTICLE_RADIUS = 2; // 3
let PARTICLE_BETWEEN_LINE_DIST = 50; // see json for min value

let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
let particles = [];

// mouse related
let useMousePosition = false;
let mousePosition = {
	x: 0,
	y: 0,
};
let mousePressInterval;
let mousePressElapsed = 0;
let mousePressed = false;
let mousePointer = document.getElementsByClassName('mouse-pointer')[0];

// animation frame
let req;
let currentBehavior = '';
let isOkToApplyBehavior = false;
// ui
let activeUIs = [];
let UI = [];

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


/**
 * Slider change handler
 * @param {String} slider name
 * @param {Number} value
 */
const sliderChange = (slider, value) => {

	const { id } = slider.options;

	console.log(id, value, slider.options);

	if (id === 'line-length') {

		PARTICLE_BETWEEN_LINE_DIST = value;

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
			sliders.push(slider);

		});

	}

}

const reset = () => {

	ctx.globalAlpha = 1;

	isOkToApplyBehavior = false;

	for (let i = 0; i < particles.length; ++i) {

		const p = particles[i];

		// position all particle in random coordinates
		p.state.x = Math.random() * WIDTH;
		p.state.y = Math.random() * HEIGHT;

	}

	setTimeout(() => {

		isOkToApplyBehavior = true;

	}, 500);

}

/**
 *  Create Particles
 */
const createParticle = () => {

	const { particle: { length, radius, randomSize } } = activeUIs;

	// reset
	PARTICLE_LENGTH = length;
	PARTICLE_RADIUS = radius;
	particles = [];

	const Class = currentBehavior !== 'shoaling' ? Particle : Boid;

	// 1 ~ PARTICLE_RADIUS
	const maxSize = PARTICLE_RADIUS;
	const minSize = 1;

	// create particles
	for (let i = 0; i < PARTICLE_LENGTH; ++i) {

		const size = randomSize ? Math.floor(Math.random() * (maxSize - minSize + 1) + minSize) : PARTICLE_RADIUS;

		// initial vector x, y
		const min = 5;
		const max = 10;
		const vec = Math.floor(Math.random() * (max - min + 1)) + min;
		const vx = (Math.random() - .5) * vec; // -vec ~ vec
		const vy = (Math.random() - .5) * vec; // -vec ~ vec

		const particle = new Class({
			id: i,
			ctx,
			w: WIDTH,
			h: HEIGHT,
			vx,
			vy,
			r: size,
			mass: size,
			defaultColor: PARTICLE_COLOR,
			collideColor: PARTICLE_COLLIDE_COLOR,
		});

		particles.push(particle);

	}

}

/**
 * Repaint the context(reset)
 */
const repaint = () => {

	ctx.fillStyle = `${BG_COLOR}`;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

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
		canvas.addEventListener('mousedown', _.throttle(this.mouseHandler.bind(this), 150), false);
		canvas.addEventListener('mouseup', _.throttle(this.mouseHandler.bind(this), 150), false);
		canvas.addEventListener('mousemove', _.throttle(this.mouseHandler.bind(this), 150), false);

		// Hammer
		this.hammer = new Hammer.Manager(this.el);
		this.hammer.add(new Hammer.Press());
		this.hammer.on('press pressup', this.mouseHandler.bind(this));

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

				setTimeout(() => {

					// dispatch resize
					const re = new Event('resize');
					window.dispatchEvent(re);

					req = requestAnimationFrame(this.tick.bind(this));

					// default active
					this.setActiveUI();

				}, 500);

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

		// find which ui is active
		activeUIs = UI
			.reduce((activeUIs, uiGroup) => activeUIs.concat(uiGroup.children.filter(ui => ui.active)), [])
			.pop();


		// update alert
		this.el.getElementsByClassName('alert')[0].innerHTML = activeUIs.description;

		currentBehavior = activeUIs.value;

		console.log(`currentBehavior: ${currentBehavior}`, 'activeUIs: ', activeUIs);

		// creat sliders
		createSlider();

		// creat particle
		createParticle();

		// position particles randomly
		reset();

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

		canvas.width = WIDTH;
		canvas.height = HEIGHT;

		for (let i = 0; i < PARTICLE_LENGTH; ++i) {

			particles[i].state.w = WIDTH;
			particles[i].state.h = HEIGHT;

		}

	},

	render() {

		// repaint
		repaint();

		const center = { x: canvas.width * .5, y: canvas.height * .5 };

		// behaviors
		if (!isOkToApplyBehavior) return;

		switch (currentBehavior) {

		case 'simple-collision':

			// n-between collision detection & bounce
			simpleCollision(particles);

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
			lineBetween(particles, ctx, PARTICLE_BETWEEN_LINE_DIST);

			break;

		case 'spring':

			// spring
			spring(particles, mousePosition, ctx, PARTICLE_COLOR);

			break;

		case 'shoaling':

			// simple shoaling
			shoaling(particles, center);

			break;

		default:
			//
		}

		this.boundaryCheck();

	},

	// simple boundary check & bounce
	boundaryCheck() {

		for (let i = 0; i < particles.length; i++) {

			const p = particles[i];
			const { x, y, vx, vy, r } = p.state;

			// boundary x
			if (x - r < 0) {

				p.state.x = r;
				p.state.vx *= -1;

			} else if (x + r > WIDTH) {

				p.state.x = WIDTH - r;
				p.state.vx *= -1;

			}

			// boundary y
			if (y - r < 0) {

				p.state.y = r;
				p.state.vy *= -1;

			} else if (y + r > HEIGHT) {

				p.state.y = HEIGHT - r;
				p.state.vy *= -1;

			}

		}

	},

	tick() {

		this.render();

		req = requestAnimationFrame(this.tick.bind(this));

	},

};

export default CanvasParticle;
