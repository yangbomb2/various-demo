/**
 * Simple Particle
 */

let collidingResetTimer;

class Particle {

  constructor(args) {

    this.ctx = args.ctx;
    delete args.ctx;

    this.props = {...args};
    this.state = this.getDefaultState();

  }

  update() {

    const { w, h, r, color } = this.props;

    // TODO boundary should be a part of behaviors
    const newState = {...this.state};
    const { x, y, vx, vy, tx, ty, freeMove, moveWithTargetPosition } = newState;

    // if free is on, move freely & randomly
    if (freeMove) {

      // update x, y
      newState.x += vx;
      newState.y += vy;

    }

    // if true, move toward current tx, ty
    if (moveWithTargetPosition) {

      newState.x += (tx - x) * .065;
      newState.y += (ty - y) * .065;

    }

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

    const { r, defaultColor, collideColor } = this.props;
    const { x, y, w, h, collision } = this.state;

    this.ctx.beginPath();
 
    this.ctx.fillStyle = collision ? collideColor : defaultColor;
    this.ctx.arc(x, y, r, 0, Math.PI * 2, false);

    // fill
    this.ctx.fill();

    return this;

  }

  // default states
  getDefaultState() {

    const { w, h, defaultColor } = this.props;

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
      vx,
      vy,
      tx: 0,
      ty: 0,
      rotation: 0, // in rad
      collision: false, // boo. indicating if this particle colliding with others or walls
      freeMove: true,
      moveWithTargetPosition: false, // if true, 
    };

  }

}


export default Particle;
