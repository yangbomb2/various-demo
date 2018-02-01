/*
  Canvas Particle

  @author min yang
*/

// style
import style from 'StyleRoot/component/canvas-particle.scss';

// dependencies
import _ from 'lodash';

// refs
const canvasContainer = document.getElementsByClassName('canvas-container')[0];
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

// set width & height
const WIDTH = window.innerWidth;
const HEIGHT = 500;

// particle related
const particles = [];
const PARTICLE_LENGTH = 50;
const PARTICLE_BETWEEN_MIN_DIST = 150;
const PARTICLE_COLOR = 'rgba(33,33,33,1)';
const PARTICLE_RADIUS = 5;
const BG_COLOR = 'rgba(251,251,251,1)';
// particle related ends


// ui
let activeUIs = [];
let UI = [
  {
    name: 'behaviors',
    children: [
      {
        id: 0,
        type: 'checkbox',
        value: 'collision',
        active: false,
      },
      {
        id: 1,
        type: 'checkbox',
        value: 'line-between',
        active: false,
      },
    ],
  },
];

// factory fn
const createUI = (uiGroup) => {

  const name = uiGroup.name;
  const children = uiGroup.children;

  const childrenHTML = children.reduce((all, ui) => {

    const { id, type, value } = ui;

    const renderedUI = `
      <div class="form-check">
        <input class="form-check-input" type="${type}" name="${name}" id="${id}" value="${value}">
        <label class="form-check-label" for="${id}">
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

    // Some acceleration for the partcles
    // depending upon their distance
    const ax = dx / 5000;
    const ay = dy / 5000;

    // p1.state.vx -= ax;
    // p1.state.vy -= ay;

    // p2.state.vx += ax;
    // p2.state.vy += ay;

  }

}

// in between collision
const collision = (p1, p2) => {

  const dx = p2.state.x - p1.state.x;
  const dy = p2.state.y - p1.state.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = PARTICLE_RADIUS * 2;

  if (dist < minDist) {

    const angle = Math.atan2(dy, dx);

    const tx = p1.state.x + Math.cos(angle) + minDist;
    const ty = p1.state.y + Math.sin(angle) + minDist;

    // p1.state.x = tx;
    // p1.state.y = ty;

    p1.state.vx *= -1;
    p1.state.vy *= -1;

    p2.state.vx *= -1;
    p2.state.vy *= -1;

  }


}

// animation frame
let req;

// cavnas related fn
class Particle {

  constructor(args) {

    this.ctx = args.ctx;
    delete args.ctx;

    this.props = {...args};
    this.state = this.getDefaultState();

  }

  update() {

    const { w, h } = this.props;

    const newState = {...this.state};
    const { vx, vy } = newState;

    // update x, y
    newState.x += vx;
    newState.y += vy;

    // simple boundary bounce

    // boundary x
    if (newState.x - newState.r < 0) {

      newState.x = newState.r;
      newState.vx *= -1;

    } else if (newState.x + newState.r > w) {

      newState.x = w - newState.r;
      newState.vx *= -1;

    }

    // boundary y
    if (newState.y - newState.r < 0) {

      newState.y = newState.r;
      newState.vy *= -1;

    } else if (newState.y + newState.r > h) {

      newState.y = h - newState.r;
      newState.vy *= -1;

    }

    this.state = newState;

    return this;

  }

  draw() {

    const { x, y, w, h, r, color } = this.state;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2, false);

    // fill
    this.ctx.fill();

    return this;

  }

  // default states
  getDefaultState() {

    const { w, h } = this.props;

    // speed vec
    const min = 2;
    const max = 6;
    const vec = Math.floor(Math.random() * (max - min + 1)) + min;

    const vx = (Math.random() - .5) * vec; // -1 ~ 1
    const vy = (Math.random() - .5) * vec; // -1 ~ 1

    return {
      isOkToRenderContent: true,
      x: Math.random() * w,
      y: Math.random() * h,
      r: PARTICLE_RADIUS,
      vx,
      vy,
      color: PARTICLE_COLOR,
    };

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

    // create particles
    for (let i = 0; i < PARTICLE_LENGTH; ++i) {

      const particle = new Particle({
        id: i,
        ctx: ctx,
        w: window.innerWidth,
        h: HEIGHT,
      });

      particles.push(particle);

    }

    // Form & UI
    const form = data.el.getElementsByTagName('form')[0];

    let uiHTML = '';
    const ui = UI.forEach((uiGroup) => uiHTML += createUI(uiGroup));

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
      const targetUI = targetUIGroup.children.filter(ui => ui.value === target.value)[0];

      if (targetUI) {

        targetUI.active = target.checked;

      }

    }

    // find which ui is active
    activeUIs = UI.map(uiGroup => {

      const activeUI = uiGroup.children.filter(ui => ui.active);

      if (activeUI.length) {

        return activeUI.map(ui => ui.value).join(',');

      }

      return [];

    });

    // console.log(activeUIs);

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

      for (let j = i + 1; j < PARTICLE_LENGTH; ++j) {

        // n-between collision detection & bounce
        if (activeUIs.indexOf('collision') !== -1) collision(p, particles[j]);

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
