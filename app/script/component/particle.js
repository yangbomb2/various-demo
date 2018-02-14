/**
 * Simple Particle
 */

class Particle {

	constructor(args) {

		this.ctx = args.ctx;
		delete args.ctx;

		this.props = { ...args };
		this.state = this.getDefaultState();

	}

	update() {

		const { w, h, r, color } = this.props;

		// TODO boundary should be a part of behaviors
		const newState = { ...this.state };
		const { x, y, vx, vy, staticVX, staticVY, tx, ty, freeMove, moveWithTargetPosition, boundaryCheck } = newState;

		// if free is on, move freely & randomly
		if (freeMove) {

			// update x, y
			newState.x += staticVX;
			newState.y += staticVY;

		} else if (moveWithTargetPosition) {

			// if true, move toward current tx, ty
			newState.x += (tx - x) * .07;
			newState.y += (ty - y) * .07;

		}

		// boundary check
		if (boundaryCheck) {

			// simple boundary check & bounce
			// boundary x
			if (newState.x - r < 0) {

				newState.x = r;
				newState.staticVX *= -1;

			} else if (newState.x + r > w) {

				newState.x = w - r;
				newState.staticVX *= -1;

			}

			// boundary y
			if (newState.y - r < 0) {

				newState.y = r;
				newState.staticVY *= -1;

			} else if (newState.y + r > h) {

				newState.y = h - r;
				newState.staticVY *= -1;

			}

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
		this.ctx.fill();

		// draw bounding box
		if (collision) {

			this.ctx.strokeStyle = collideColor;
			this.ctx.lineWidth = .5;
			this.ctx.strokeRect(x - r, y - r, r * 2, r * 2);

		}

		this.ctx.closePath();

		return this;

	}

	// default states
	getDefaultState() {

		const { w, h, defaultColor } = this.props;

		// staic speed vec
		const min = 2;
		const max = 6;
		const vec = Math.floor(Math.random() * (max - min + 1)) + min;
		const vx = (Math.random() - .5) * vec; // -1 ~ 1
		const vy = (Math.random() - .5) * vec; // -1 ~ 1

		return {
			isOkToRenderContent: true,
			x: Math.random() * w,
			y: Math.random() * h,
			vx: 0,
			vy: 0,
			tx: 0,
			ty: 0,
			staticVX: vx,
			staticVY: vy,
			rotation: 0, // in rad
			boundaryCheck: true,
			collision: false, // boo. indicating if this particle colliding with others or walls
			freeMove: true,
			moveWithTargetPosition: false, // if true,
		};

	}

}


export default Particle;
