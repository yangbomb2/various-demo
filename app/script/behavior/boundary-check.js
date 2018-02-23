/**
 * Simple boundary check(wall)
 *
 */

const BOUNCE_VEC = -.95;

// boundary is vector
const boundaryCheck = (particles, boundary) => {

	const { top, right, bottom, left } = boundary;

	for (let i = 0; i < particles.length; i++) {

		const p = particles[i];
		const { x, y, vx, vy, r } = p.state;

		// boundary x
		if (x - r < left) {

			p.state.x = r;
			p.state.vx *= BOUNCE_VEC;

		} else if (x + r > right) {

			p.state.x = right - r;
			p.state.vx *= BOUNCE_VEC;

		}

		// boundary y
		if (y - r < top) {

			p.state.y = r;
			p.state.vy *= BOUNCE_VEC;

		} else if (y + r > bottom) {

			p.state.y = bottom - r;
			p.state.vy *= BOUNCE_VEC;

		}

	}

};

export default boundaryCheck;
