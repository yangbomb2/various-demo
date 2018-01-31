/*
  Canvas Particle

  @author min yang
*/

// style
import style from 'StyleRoot/component/canvas-particle.scss';

// refs
const canvasContainer = document.getElementsByClassName('canvas-container')[0];
const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

// set width & height
const WIDTH = window.innerWidth;
const HEIGHT = 500;

const particles = [];
const particleLength = 999;
const PARTICLE_COLOR = 'rgba(251,251,251,1)';
const PARTICLE_RADIUS = 2;

const BG_COLOR = 'rgba(0,0,0,1)';

// animation frame
let req;

// cavnas related fn
class Particle {

  constructor(args) {

    this.ctx = args.ctx;
    delete args.ctx;

    this.props = {...args};
    this.state = this.getDefaultState();
    // console.log(this.props);
    // console.log(this.state);

  }

  update() {

    const { w, h } = this.props;

    const newState = {...this.state};
    const { vx, vy } = newState;

    // update x, y
    newState.x += vx;
    newState.y += vy;

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
    const max = 4;
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

const CanvasParticle = {

  init(data) {

    console.log(data);

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // create particles
    for (let i = 0; i < particleLength; ++i) {

      const particle = new Particle({
        id: i,
        ctx: ctx,
        w: WIDTH,
        h: HEIGHT,
      });

      particles.push(particle);

    }

    req = requestAnimationFrame(this.tick.bind(this));

  },

  render() {

    // repaint
    repaint();

    // update
    for (let i = 0; i < particleLength; ++i) {

      particles[i].draw().update();

    }

  },

  tick() {

    this.render();

    req = requestAnimationFrame(this.tick.bind(this));

  },



};

export default CanvasParticle;
