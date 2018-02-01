/**
 * Simple Particle
 */

class Particle {

  constructor(args) {

    this.ctx = args.ctx;
    delete args.ctx;

    this.props = {...args};
    this.state = this.getDefaultState();

  }

  update() {

    const { w, h, r, color } = this.props;

    const newState = {...this.state};
    const { vx, vy, move } = newState;

    // if self move is off, don't move
    if (!move) return;

    // update x, y
    newState.x += vx;
    newState.y += vy;

    // simple boundary check & bounce
    // boundary x
    if (newState.x - r < 0) {

      newState.x = r;
      newState.vx *= -1;

    } else if (newState.x + r > w) {

      newState.x = w - r;
      newState.vx *= -1;

    }

    // boundary y
    if (newState.y - r < 0) {

      newState.y = r;
      newState.vy *= -1;

    } else if (newState.y + r > h) {

      newState.y = h - r;
      newState.vy *= -1;

    }

    this.state = newState;

    return this;

  }

  draw() {

    const { r, color } = this.props;
    const { x, y, w, h } = this.state;

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
      move: true,
      vx,
      vy,
      angle: 0, // in rad
    };

  }

}


export default Particle;
