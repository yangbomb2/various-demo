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

// import behaviors
import { spring, simpleCollision, simpleRotation, pushPull, simpleOrbit, lineBetween } from '../behavior';

// particle related
const particles = [];
const PARTICLE_LENGTH = 250;
const PARTICLE_BETWEEN_MIN_DIST = 75;
const PARTICLE_COLOR = 'rgba(33,33,33,1)';
const PARTICLE_COLLIDE_COLOR = 'rgba(241,0,0,1)';
const PARTICLE_RADIUS = 2; // 3
const BG_COLOR = 'rgba(251,251,251,1)';
// particle related ends

// refs
const canvasContainer = document.getElementsByClassName('canvas-container')[0];
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

// set width & height
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

// mouse related
let useMousePosition = false;
let mousePos = {
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
const createUI = (uiGroup, i) => {

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

// TODO: adv collision in between
const advCollision = (p1, p2) => {

	if (!p1.state.freeMove) p1.state.freeMovemove = true;

	const dx = p2.state.x - p1.state.x;
	const dy = p2.state.y - p1.state.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const minDist = PARTICLE_RADIUS * 2;

	const angle = Math.atan2(dy, dx);
	const tx = p1.state.x + Math.cos(angle) + minDist;
	const ty = p1.state.y + Math.sin(angle) + minDist;

}

// position all particle in random coordinates
const spreadParticleInRandomPosition = () => {

	isOkToApplyBehavior = false;

	for (let i = 0; i < particles.length; ++i) {

		const p = particles[i];

		p.state.freeMove = false;
		p.state.moveWithTargetPosition = true;

		p.state.tx = Math.random() * canvas.width;
		p.state.ty = Math.random() * canvas.height;

	}

	setTimeout(() => {

		isOkToApplyBehavior = true;

	}, 500);

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

		// create particles
		for (let i = 0; i < PARTICLE_LENGTH; ++i) {

			const particle = new Particle({
				id: i,
				ctx: ctx,
				w: WIDTH,
				h: HEIGHT,
				r: PARTICLE_RADIUS,
				defaultColor: PARTICLE_COLOR,
				collideColor: PARTICLE_COLLIDE_COLOR,
			});

			particles.push(particle);

		}

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
				UI.forEach((uiGroup, i) => uiHTML += createUI(uiGroup, i));
				form.innerHTML = uiHTML;

				// default active
				this.setActiveUI();

				setTimeout(() => {

					// dispatch resize
					const re = new Event('resize');
					window.dispatchEvent(re);

					req = requestAnimationFrame(this.tick.bind(this));

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

		// TODO findout why
		ctx.globalAlpha = .5;

		// find which ui is active
		activeUIs = UI
			.reduce((activeUIs, uiGroup) => activeUIs.concat(uiGroup.children.filter(ui => ui.active)), [])
			.pop();


		// update alert
		this.el.getElementsByClassName('alert')[0].innerHTML = activeUIs.description;

		currentBehavior = activeUIs.value;

		// console.log('activeUIs: ', activeUIs);
		console.log(`currentBehavior: ${currentBehavior}`);

		spreadParticleInRandomPosition();

		// if (currentBehavior === 'simple-orbit' ||
		//     currentBehavior === 'simple-collision' ||
		//     currentBehavior === 'push-and-pull' ||
		//     currentBehavior === 'line-between') {
		// }

	},

	mouseHandler(e) {

		switch (e.type) {

		case 'mousemove':

			const box = e.target.getBoundingClientRect();
			mousePos.x = e.clientX - box.left;
			mousePos.y = e.clientY - box.top;

			break;

		case 'mousedown':
		case 'press':

			mousePressed = true;
			mousePressElapsed = window.performance.now();

			break;

		case 'mouseup':
		case 'pressup':

			mousePressed = false;
			mousePressElapsed = window.performance.now() - mousePressElapsed;

			if (currentBehavior === 'simple-orbit' || currentBehavior === 'push-and-pull') {

				spreadParticleInRandomPosition();

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

			particles[i].props.w = WIDTH;
			particles[i].props.h = HEIGHT;

		}

	},

	render() {

		// repaint
		repaint();

		// update
		for (let i = 0; i < PARTICLE_LENGTH; ++i) {

			const p = particles[i];

			p.draw().update();

			// behaviors
			if (!isOkToApplyBehavior) continue;

			// simple rotation
			if (currentBehavior === 'simple-rotation') simpleRotation(p, { x: canvas.width * .5, y: canvas.height * .5 }, PARTICLE_LENGTH, mousePressed);

			// push-and-pull
			if (currentBehavior === 'push-and-pull') pushPull(p, mousePos, mousePressed, PARTICLE_LENGTH);

			// simple orbit
			if (currentBehavior === 'simple-orbit') simpleOrbit(p, { x: canvas.width * .5, y: canvas.height * .5});

			// spring
			if (currentBehavior === 'spring') spring(p);

			// these are in-between. nested loop required.
			for (let j = i + 1; j < PARTICLE_LENGTH; ++j) {

				// n-between collision detection & bounce
				if (currentBehavior === 'simple-collision') simpleCollision(p, particles[j], PARTICLE_RADIUS * 2);

				// check in-between distance against neibors and draw line
				if (currentBehavior === 'line-between') lineBetween(p, particles[j], PARTICLE_BETWEEN_MIN_DIST, ctx);

			}


		}

	},

	tick() {

		this.render();

		req = requestAnimationFrame(this.tick.bind(this));

	},

};

export default CanvasParticle;
