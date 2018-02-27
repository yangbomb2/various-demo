/**
 * Simple Particle
 */

class Particle {

	constructor(args) {

		this.ctx = args.ctx;
		delete args.ctx;

		this.prevState = void 0;
		this.state = this.getDefaultState(args);

	}

	update() {

		this.prevState = Object.assign({}, this.state);

		this.draw();

		return this;

	}

	draw() {

		const { x, y, collision, opacity, r, defaultColor, collideColor } = this.state;

		this.ctx.beginPath();
		this.ctx.fillStyle = collision ? `rgba(${collideColor}, 1)` : `rgba(${defaultColor}, ${opacity})`;
		this.ctx.arc(x, y, r, 0, Math.PI * 2, false);
		this.ctx.fill();

		// draw bounding box
		if (collision) {

			this.ctx.strokeStyle = `rgba(${collideColor}, 1)`;
			this.ctx.lineWidth = 1;
			this.ctx.strokeRect(x - r, y - r, r * 2, r * 2);

		}

		this.ctx.closePath();

		return this;

	}

	postion(position) {

		const { x = 0, y = 0, z = 0 } = position;

		this.state.x = x;
		this.state.y = y;
		this.state.z = z;

		return this;

	}

	/**
	 * Getter
	 *
	 * return Object
	 */
	get position() {

		return {
			x: this.state.x,
			y: this.state.y,
			z: this.state.z,
		}

	}

	// default states
	getDefaultState(options) {

		const { x, y, z = 0, w, h, vx, vy, defaultColor } = options;

		return {
			...options,
			x,
			y,
			z,
			vx,
			vy,
			opacity: 1,
			rotation: 0, // in rad
			collision: false, // boo. indicating if this particle colliding with others or walls
		};

	}

}


export default Particle;
