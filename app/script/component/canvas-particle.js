/*
  Canvas Particle Index
  @author min yang
*/

// style
import style from 'StyleRoot/component/canvas-particle.scss';

// dependencies
import _ from 'lodash';
import Particle from './particle';

// set width & height
const WIDTH = window.innerWidth;
const HEIGHT = 500;

// particle related
const particles = [];
const PARTICLE_LENGTH = 200; // 100
const PARTICLE_BETWEEN_MIN_DIST = 100;
const PARTICLE_COLOR = 'rgba(33,33,33,1)';
const PARTICLE_COLLIDE_COLOR = 'rgba(241,0,0,1)';
const PARTICLE_RADIUS = 5; // 3
const MOUSE_CURSOR_RADIUS = 30;
const BG_COLOR = 'rgba(251,251,251,1)';
// particle related ends

// refs
const canvasContainer = document.getElementsByClassName('canvas-container')[0];
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

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

// ui
let activeUIs = [];
let UI = [
  {
    name: 'behaviors',
    children: [
      {
        type: 'radio',
        value: 'simple-collision',
        label: 'simple collision',
        active: false,
      },
      {
        type: 'radio',
        value: 'adv. collision',
        label: 'advance collision',
        active: false,
        disabled: true,
      },
      {
        type: 'radio',
        value: 'simple-rotation',
        label: 'simple rotation',
        active: false,
      },
      {
        type: 'radio',
        value: 'push-and-pull',
        label: 'push and pull',
        active: false,
      },
      {
        type: 'radio',
        value: 'line-between',
        label: 'line inbetween',
        active: false,
      },
      {
        type: 'radio',
        value: 'simple-orbit',
        label: 'orbit',
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

// ====BEHAVIORS=====
// check distance
// Distance calculator between two particles
const lineInBetween = (p1, p2, minDist) => {

  if (!p1.state.freeMove) p1.state.freeMove = true;

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

  // with free move
  p1.state.freeMove = true;
  p1.state.moveWithTargetPosition = false;

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

  if (!p1.state.freeMove) p1.state.freeMovemove = true;

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
const angleInc = .01;
const cos = Math.cos(angleInc);
const sin = Math.sin(angleInc);

const simpleRotation = (p) => {

  const { x, y, freeMove, rotation } = p.state;

  p.state.freeMove = false;
  p.state.moveWithTargetPosition = true;

  // center coord
  const cx = canvas.width * .5;
  const cy = canvas.height * .5;

  // distance
  const dx = x - cx;
  const dy = y - cy;

  // radius
  const r = canvas.height * .45;

  // const angle = Math.sqrt(dx * dx, dy * dy);
  const newAngle = rotation + Math.PI * 2 / PARTICLE_LENGTH * p.props.id;

  // get tx, ty
  const tx = cx + Math.cos(newAngle) * r;
  const ty = cy + Math.sin(newAngle) * r;

  p.state.tx = tx;
  p.state.ty = ty;
  p.state.rotation += .01;

  // easing
  // p.state.x += (tx - x) * .025;
  // p.state.y += (ty - y) * .025;

}


/**
 * push-and-pull towrad mouse position
 * @param  {[type]} p [description]
 */
const pushAndPull = (p) => {

  const { x, y, move, rotation } = p.state;

  p.state.freeMove = false;
  p.state.moveWithTargetPosition = true;

  let r;
  let newRotation;
  const cx = mousePos.x;
  const cy = mousePos.y;

  if (mousePressed) {

    // radius
    const r = Math.random() * 200;
    const newRotation = rotation + Math.PI * 2 / PARTICLE_LENGTH * p.props.id;

    // get tx, ty
    const tx = cx + Math.cos(newRotation) * r;
    const ty = cy + Math.sin(newRotation) * r;

    p.state.tx = tx;
    p.state.ty = ty;

  } else {

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = MOUSE_CURSOR_RADIUS + p.props.r + 10;

    if (dist < minDist) {

      // similar to collision
      const theta = Math.atan2(dy, dx);
      const tx = cx + Math.cos(theta) * minDist;
      const ty = cy + Math.sin(theta) * minDist;

      p.state.tx = tx;
      p.state.ty = ty;

    }

  }

}

/**
 * Simple oribiting based on centerX, centerY
 *
 * @param  {Object} p [Particle]
 */
const simpleOrbit = (p) => {

  const { id } = p.props;
  const { x, y, freeMove, angle } = p.state;

  // prevent self move
  p.state.freeMove = false;
  p.state.moveWithTargetPosition = false;

  // get tx, ty from the center x, center y

  // center x, y
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // get distance x, y
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx, dy * dy);

  // the further away, the faster it orbit around center
  const angleInc = ((dist / cx) + 1 ) * .05 // .005 ~ 0.01;
  // const angleInc = ((id / PARTICLE_LENGTH - 1) + 1 ) * .005 // .005 ~ 0.01;
  // const cos = Math.cos(angleInc);
  // const sin = Math.sin(angleInc);

  const x1 = (cos * dx - sin * dy);
  const y1 = (cos * dy + sin * dx);

  const tx = cx + x1;
  const ty = cy + y1;

  p.state.x = tx;
  p.state.y = ty;

}

// position all particle in random coordinates
const spreadParticleInRandomPosition = () => {

  for (let i = 0; i < particles.length; ++i) {

    const p = particles[i];

    p.state.tx = Math.random() * canvas.width;
    p.state.ty = Math.random() * canvas.height;

  }

}

/**
 * Repaint the context(reset)
 */
const repaint = () => {

  ctx.fillStyle = `${BG_COLOR}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

}

const drawMouseCursor = () => {

  ctx.beginPath();
  ctx.lineWidth = .5;
  ctx.strokeStyle = '#111';
  ctx.arc(mousePos.x, mousePos.y, MOUSE_CURSOR_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

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
    canvas.addEventListener('mousedown', _.throttle(this.mouseHandler.bind(this), 150), false);
    canvas.addEventListener('mouseup', _.throttle(this.mouseHandler.bind(this), 150), false);
    canvas.addEventListener('mousemove', _.throttle(this.mouseHandler.bind(this), 150), false);

    // dispatch resize
    const re = new Event('resize');
    window.dispatchEvent(re);

    setTimeout(() => {

      req = requestAnimationFrame(this.tick.bind(this));

      // default active
      this.setActiveUI();

      // random position initially
      spreadParticleInRandomPosition();

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

    this.setActiveUI();

  },

  setActiveUI() {

    // find which ui is active
    activeUIs = UI
      .reduce((activeUIs, uiGroup) => activeUIs.concat(uiGroup.children.filter(ui => ui.active)), [])
      .map(ui => ui.value);

    currentBehavior = activeUIs.pop();

    console.log(`currentBehavior: ${currentBehavior}`);

  },

  mouseHandler(e) {

    switch(e.type) {

    case 'mousemove':

      const box = e.target.getBoundingClientRect();
      mousePos.x = e.clientX;
      mousePos.y = e.clientY - box.top;

      break;

    case 'mousedown':

      mousePressed = true;
      mousePressElapsed = window.performance.now();

      break;

    case 'mouseup':

      mousePressed = false;
      mousePressElapsed = window.performance.now() - mousePressElapsed;

      if (currentBehavior === 'simple-orbit' || currentBehavior === 'push-and-pull') {

        spreadParticleInRandomPosition();

      }

      break;

    }


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

    // mouse pointer
    // drawMouseCursor();

    // update
    for (let i = 0; i < PARTICLE_LENGTH; ++i) {

      const p = particles[i];

      // behaviors

      // simple rotation
      if (currentBehavior === 'simple-rotation') simpleRotation(p);

      // push-and-pull
      if (currentBehavior === 'push-and-pull') pushAndPull(p);

      // simple orbit
      if (currentBehavior === 'simple-orbit') simpleOrbit(p);

      // these are in-between. nested loop required.
      for (let j = i + 1; j < PARTICLE_LENGTH; ++j) {

        // n-between collision detection & bounce
        if (currentBehavior === 'simple-collision') simpleCollision(p, particles[j]);

        // check in-between distance against neibors and draw line
        if (currentBehavior === 'line-between') lineInBetween(p, particles[j], PARTICLE_BETWEEN_MIN_DIST);

      }

      p.draw().update();

    }

  },

  tick() {

    this.render();

    req = requestAnimationFrame(this.tick.bind(this));

  },

};

export default CanvasParticle;
