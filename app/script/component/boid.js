/**
 * Boid
 *
 * @author min yang
 * ref: https://www.red3d.com/cwr/boids/
 *
*/

import Particle from './particle';

const toRag = (deg) => deg * Math.PI / 180;
const toDeg = (rad) => rad * 180 / Math.PI;

// polygon
const points = 3; // triangle
const angleInc = Math.PI * 2 / points;

class Boid extends Particle {

	constructor(arg) {

		super(arg);

	}

	// override super.draw method
	draw() {

		const { r, defaultColor, collideColor } = this.props;
		const { x, y, w, h, vx, vy, collision, staticVY, staticVX, isFocalBoid } = this.state;

		// get rotaion value from vector X, Y
		const startAngle = Math.atan2(vy, vx);

		// draw triangle
		this.ctx.beginPath();
		this.ctx.fillStyle = isFocalBoid ? collideColor : defaultColor;

		for (let i = 0; i < points; i++) {

			const px = x + Math.cos(angleInc * i + startAngle) * r;
			const py = y + Math.sin(angleInc * i + startAngle) * r;
			this.ctx[i === 0 ? 'moveTo' : 'lineTo'](px, py);

		}

		this.ctx.closePath();
		this.ctx.fill();

		return this;


	}

	getDefaultState() {

		return Object.assign(super.getDefaultState(), {
			isFocalBoid: false,
		});

	}

}

export default Boid;
