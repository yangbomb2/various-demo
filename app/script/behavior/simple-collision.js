/**
 * Simple collision
 * @param {*} p1
 * @param {*} p2
 * @param {*} minDist
 */

// check collision
const simpleCollisionCheck = (p1, p2) => {

	const dx = p2.state.x - p1.state.x;
	const dy = p2.state.y - p1.state.y;

	const dist = Math.sqrt(dy * dy + dx * dx);
	const minDist = p1.state.r + p2.state.r;
	const isColliding = dist < minDist;

	if (isColliding) {

		// angle between two particles
		const angle = Math.atan2(dy, dx);
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		p1.state.vx *= -1;
		p1.state.vy *= -1;

		p2.state.x = p1.state.x + cos * minDist;
		p2.state.y = p1.state.y + sin * minDist;

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

const simpleCollision = (particles) => {

	for (let i = 0; i < particles.length; i++) {

		// move position
		const p1 = particles[i];
		const { vx, vy } = p1.state;

		p1.state.x += vx;
		p1.state.y += vy;
		p1.update();

		// collision check
		for (let j = i + 1; j < particles.length; j++) {

			simpleCollisionCheck(p1, particles[j]);

		}

	}

}

export default simpleCollision;
