const F = 1;

/**
 *
 * Momentum = m(mass) * v(vecolity)
 *
 * P = m * v
 *
 * Total Momentum is equal to combined momentum before and after collision.
 * Let's say, There are 2 Object. A,B.
 * When A, B collides, both momentumbs should be reserved.
 *
 * Break the momentum into two dimentions(x,y)
 * Momentum in x
 * Momentum in y
 *
 * P(ax) -- collision --> P(ax2)
 * P(ay) -- collision --> P(ay2)
 *
 * P(ax) + P(bx) == P(ax2) + P(bx2)
 * P(ay) + P(by) == P(ay2) + P(by2)
 * (m0 * v0) + (m0 * v1) = (m0 * v0Final) + (m0 * v1Final)
 *
 * v0Final = (m0 - m0) * v0 + 2 * m0 * v1 / (m0 + m0)
 * v1Final = (m0 - m0) * v1 + 2 * m0 * v0 / (m0 + m0)
 */
const getVelocityXwithMomentum = (m0, m1, v0, v1) => ((m0 - m0) * v0 + 2 * m0 * v1) / (m0 + m0);


// var dx1F = (v1 * Math.cos(theta1 - phi) * (m0 - m1) + 2 * m1 * v2 * Math.cos(theta2 - phi)) / (m0 + m1) * Math.cos(phi) + v1 * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2);

/**
 * more ellaborative collision check with momentum
 * momemtum + angle applied.
 *
 * @param {Particle} p1
 * @param {Patticle} p2
 */
const advCollisionCheck = (p1, p2) => {

	// get the dist between particles
	const dx = p2.state.x - p1.state.x;
	const dy = p2.state.y - p1.state.y;
	const phi = Math.atan2(dy, dx);
	const cos = Math.cos(phi);
	const sin = Math.sin(phi);

	const distSQ = dy * dy + dx * dx;
	const dist = Math.sqrt(distSQ);
	const minDist = p1.state.r + p2.state.r;
	const isColliding = dist < minDist;

	if (isColliding) {

		const { vx: vx0, vy: vy0, mass: m0} = p1.state;
		const { vx: vx1, vy: vy1, mass: m1} = p2.state;

		const v1 = Math.sqrt(vx0 * vx0 + vy0 * vy0);
		const v2 = Math.sqrt(vx1 * vx1 + vy1 * vy1);

		// get each angles with velocity
		const theta1 = Math.atan2(vy0, vx0);
		const theta2 = Math.atan2(vy1, vx1);

		// TODO
		var dx1F = (v1 * Math.cos(theta1 - phi) * (m0 - m1) + 2 * m1 * v2 * Math.cos(theta2 - phi)) / (m0 + m1) * Math.cos(phi) + v1 * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI / 2);
		var dy1F = (v1 * Math.cos(theta1 - phi) * (m0 - m1) + 2 * m1 * v2 * Math.cos(theta2 - phi)) / (m0 + m1) * Math.sin(phi) + v1 * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI / 2);

		var dx2F = (v2 * Math.cos(theta2 - phi) * (m1 - m0) + 2 * m0 * v1 * Math.cos(theta1 - phi)) / (m0 + m1) * Math.cos(phi) + v2 * Math.sin(theta2 - phi) * Math.cos(phi + Math.PI / 2);
		var dy2F = (v2 * Math.cos(theta2 - phi) * (m1 - m0) + 2 * m0 * v1 * Math.cos(theta1 - phi)) / (m0 + m1) * Math.sin(phi) + v2 * Math.sin(theta2 - phi) * Math.sin(phi + Math.PI / 2);

		// get a new angles.
		p1.state.vx = dx1F;
		p1.state.vy = dy1F;
		p2.state.vx = dx2F;
		p2.state.vy = dy2F;

		// px = vx * m
		// px0 + px1 == px2 + px3
		// const px0 = m0 * vx0;
		// const px1 = m0 * vx1;
		// const px2 = m0 * vx2;
		// const px3 = m0 * vx3;

		// only momentum x, vx
		// const vx0Final = getVelocityXwithMomentum(m0, m0, vx0, vx1);
		// const vx1Final = getVelocityXwithMomentum(m0, m0, vx1, vx0);
		// p1.state.vx = vx0Final;
		// p2.state.vx = vx1Final;

		// collision color
		((p1, p2) => {

			p1.state.collision = true;
			p2.state.collision = true;

			// move p2 to just ouside of minDist
			p2.state.x = p1.state.x + cos * minDist;
			p2.state.y = p1.state.y + sin * minDist;

			setTimeout(() => {

				p1.state.collision = false;
				p2.state.collision = false;

			}, 100);

		})(p1, p2);

	}

}


/**
 * Simple collision check with -1 as bounce force.
 * No momemtum applied.
 *
 * @param {Particle} p1
 * @param {Patticle} p2
 */
const simpleCollisionCheck = (p1, p2) => {

	const dx = p2.state.x - p1.state.x;
	const dy = p2.state.y - p1.state.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const minDist = p1.state.r + p2.state.r;

	if (dist < minDist) {

		const theta = Math.atan2(dy, dx);
		const cos = Math.cos(theta);
		const sin = Math.sin(theta);

		p1.state.vx *= -1;
		p1.state.vy *= -1;

		// move p2 to just ouside of minDist
		p2.state.x = p1.state.x + cos * minDist;
		p2.state.y = p1.state.y + sin * minDist;

		p2.state.vx *= -1;
		p2.state.vy *= -1;

		// collision color
		((p1, p2) => {

			p1.state.collision = true;
			p2.state.collision = true;

			setTimeout(() => {

				p1.state.collision = false;
				p2.state.collision = false;

			}, 200);

		})(p1, p2);

	}

};

const collision = (particles, simple = false) => {

	for (let i = 0; i < particles.length; i++) {

		// move position
		const p1 = particles[i];
		const { vx, vy } = p1.state;

		p1.state.x += vx;
		p1.state.y += vy;
		// if (simple) p1.state.y += vy

		p1.update();

		// collision check
		for (let j = i + 1; j < particles.length; j++) {

			simple ? simpleCollisionCheck(p1, particles[j]) : advCollisionCheck(p1, particles[j]);

		}

	}

}

export default collision;
