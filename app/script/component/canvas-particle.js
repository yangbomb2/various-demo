/*
  Canvas Particle Index

  @author min yang
*/

// style
import style from 'StyleRoot/component/canvas-particle.scss';

// dependencies
import _ from 'lodash';
import Particle from './particle';

// refs
const canvasContainer = document.getElementsByClassName('canvas-container')[0];
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

// set width & height
const WIDTH = window.innerWidth;
const HEIGHT = 500;

// particle related
const particles = [];
const PARTICLE_LENGTH = 100; // 100
const PARTICLE_BETWEEN_MIN_DIST = 100;
const PARTICLE_COLOR = 'rgba(33,33,33,1)';
const PARTICLE_COLLIDE_COLOR = 'rgba(241,0,0,1)';
const PARTICLE_RADIUS = 5; // 3
const BG_COLOR = 'rgba(251,251,251,1)';
// particle related ends

// animation frame
let req;

// ui
let activeUIs = [];

// TODO, fetch this
let UI = [
  {
    name: 'behaviors',
    children: [
      {
        type: 'radio',
        value: 'simple-collision',
        active: false,
      },
      {
        type: 'radio',
        value: 'adv. collision',
        active: false,
        disabled: true,
      },

      {
        type: 'radio',
        value: 'simple-rotation',
        active: false,
      },

      {
        type: 'radio',
        value: 'line-between',
        active: false,
      },

      {
        type: 'radio',
        value: 'simple-orbit',
        active: false,
      },
    ],
  },
];

// factory fn
const createUI = (uiGroup, i) => {

  const name = uiGroup.name;
  const children = uiGroup.children;

  const childrenHTML = children.reduce((all, ui, j) => {

    const { id, type, value, disabled } = ui;

    const renderedUI = `
      <div class="form-check">
        <input class="form-check-input" type="${type}" name="${name}" id="${name}-${j}" value="${value}" ${disabled ? 'disabled' : ''}>
        <label class="form-check-label" for="${name}-${j}">
          ${value}
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


// ====BEHAVIORS=====
// check distance
// Distance calculator between two particles
const lineInBetween = (p1, p2, minDist) => {

  if (!p1.state.move) p1.state.move = true;

  const dx = p2.state.x - p1.state.x;
  const dy = p2.state.y - p1.state.y;

  const dist = Math.sqrt(dx * dx + dy * dy);

  // Draw the line when distance is smaller
  // then the minimum distance
  if (dist <= minDist) {

    const proxmity = dist/minDist; // 0 ~ 1

    // Draw the line
    ctx.beginPath();
    ctx.strokeStyle = `rgba(1,1,1, ${1 - proxmity})`;
    ctx.lineWidth = (proxmity * .5) + .5; // 0.5 ~ 1

    ctx.moveTo(p1.state.x, p1.state.y);
    ctx.lineTo(p2.state.x, p2.state.y);
    ctx.stroke();
    ctx.closePath();

  }

}

// simple collision in between
const simpleCollision = (p1, p2) => {

  if (!p1.state.move) p1.state.move = true;

  const dx = p2.state.x - p1.state.x;
  const dy = p2.state.y - p1.state.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const theta = Math.atan2(dy, dx);

  const minDist = PARTICLE_RADIUS * 2;
  const isColliding = dist < minDist;

  if (isColliding) {

    // set collision flag
    p1.state.vx *= -1;
    p1.state.vy *= -1;

    // move p2 from p1 with minDist
    p2.state.x = Math.cos(theta) * minDist + p1.state.x;
    p2.state.y = Math.sin(theta) * minDist + p1.state.y;

    p2.state.vx *= -1;
    p2.state.vy *= -1;

    // collision color
    ((p1, p2) => {

      p1.state.collision = isColliding;
      p2.state.collision = isColliding;

      setTimeout(() => {

        p1.state.collision = false;
        p2.state.collision = false;

      }, 200);

    })(p1, p2);

  }

}

// TODO: adv collision in between
const advCollision = (p1, p2) => {

  if (!p1.state.move) p1.state.move = true;

  const dx = p2.state.x - p1.state.x;
  const dy = p2.state.y - p1.state.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = PARTICLE_RADIUS * 2;

  const angle = Math.atan2(dy, dx);
  const tx = p1.state.x + Math.cos(angle) + minDist;
  const ty = p1.state.y + Math.sin(angle) + minDist;
  // p1.state.x = tx;
  // p1.state.y = ty;

}


// simple rotation
const angleInc = .05;
const cos = Math.cos(angleInc);
const sin = Math.sin(angleInc);

const simpleRotation = (p) => {

  const { x, y, move, angle } = p.state;

  if (move) p.state.move = false;

  // center coord
  const cx = window.innerWidth * .5;
  const cy = HEIGHT * .5;

  // distance
  const dx = x - cx;
  const dy = y - cy;

  // radius
  const r = HEIGHT * .45;

  // const angle = Math.sqrt(dx * dx, dy * dy);
  const newAngle = angle + Math.PI * 2 / PARTICLE_LENGTH * p.props.id;

  // get tx, ty
  const tx = cx + Math.cos(newAngle) * r;
  const ty = cy + Math.sin(newAngle) * r;
  p.state.angle += .01;

  // easing
  p.state.x += (tx - x) * .1;
  p.state.y += (ty - y) * .1;

}

/**
 * Simple oribiting based on centerX, centerY
 *
 * @param  {Object} p [Particle]
 */
const simpleOrbit = (p) => {

  const { id } = p.props;
  const { x, y, move, angle } = p.state;

  // prevent self move
  if (move) p.state.move = false;

  // get tx, ty from the center x, center y

  // center x, y
  const cx = window.innerWidth * .5;
  const cy = HEIGHT * .5;

  // get distance x, y
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx, dy * dy);

  // the further away, the faster it orbit around center
  const angleInc = ((dist / cx) + 1 ) * .005 // .005 ~ 0.01;
  // const angleInc = ((id / PARTICLE_LENGTH - 1) + 1 ) * .005 // .005 ~ 0.01;
  const cos = Math.cos(angleInc);
  const sin = Math.sin(angleInc);

  const x1 = (cos * dx - sin * dy);
  const y1 = (cos * dy + sin * dx);

  const tx = cx + x1;
  const ty = cy + y1;

  p.state.x = tx;
  p.state.y = ty;

  // easing
  // p.state.x += (tx - x) * .1;
  // p.state.y += (ty - y) * .1;

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

    // create particles
    for (let i = 0; i < PARTICLE_LENGTH; ++i) {

      const particle = new Particle({
        id: i,
        ctx: ctx,
        w: window.innerWidth,
        h: HEIGHT,
        r: PARTICLE_RADIUS,
        defaultColor : PARTICLE_COLOR,
        collideColor : PARTICLE_COLLIDE_COLOR,
      });

      particles.push(particle);

    }

    // Form & UI
    const form = data.el.getElementsByTagName('form')[0];

    let uiHTML = '';
    const ui = UI.forEach((uiGroup,i) => uiHTML += createUI(uiGroup, i));

    form.innerHTML = uiHTML;
    form.addEventListener('change', this.formChange.bind(this), false);

    window.addEventListener('resize', _.debounce(this.resize.bind(this), 300), false);

    setTimeout(() => {

      // dispatch resize
      const re = new Event('resize');
      window.dispatchEvent(re);

      req = requestAnimationFrame(this.tick.bind(this));

    }, 500);

  },

  formChange(e) {

    const target = e.target;

    // console.log(target.type, target.name, target.value, target.checked);

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

    // find which ui is active
    activeUIs = UI
      .reduce((activeUIs, uiGroup) => activeUIs.concat(uiGroup.children.filter(ui => ui.active)), [])
      .map(ui => ui.value);

  },

  resize(e) {

    canvas.width = window.innerWidth;
    canvas.height = HEIGHT;

    // update
    for (let i = 0; i < PARTICLE_LENGTH; ++i) {

      particles[i].props.w = window.innerWidth;
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

      // simple rotation
      if (activeUIs.indexOf('simple-rotation') !== -1) simpleRotation(p);

      // simple orbit
      if (activeUIs.indexOf('simple-orbit') !== -1) simpleOrbit(p);

      // these are in-between. nested loop required.
      for (let j = i + 1; j < PARTICLE_LENGTH; ++j) {

        // n-between collision detection & bounce
        if (activeUIs.indexOf('simple-collision') !== -1) simpleCollision(p, particles[j]);

        // check in-between distance against neibors and draw line
        if (activeUIs.indexOf('line-between') !== -1) lineInBetween(p, particles[j], PARTICLE_BETWEEN_MIN_DIST);

      }

    }

  },

  tick() {

    this.render();

    req = requestAnimationFrame(this.tick.bind(this));

  },

};

export default CanvasParticle;
