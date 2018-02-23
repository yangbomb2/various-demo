/**
 * push-and-pull towrad mouse position
 * @param  {[type]} p [description]
 */

const CENTER_MASS = 1000;

const pushAndPull = (particles, center, pull, ctx) => {

	const cx = center.x;
	const cy = center.y;
	let tx;
	let ty;

	for (let i = 0; i < particles.length; ++i) {

		const p = particles[i];
		const { x, y, vx, vy, move, rotation, mass } = p.state;

		p.update();

		if (pull) {

			ctx.globalAlpha = .3;

			// pull(gravitation)
			p.state.x += vx;
			p.state.y += vy;

			const dx = cx - x;
			const dy = cy - y;

			const distSQ = dy * dy + dx * dx;
			const dist = Math.sqrt(distSQ);

			// G * m1 * m2 / distance * distance
			const gForce = mass * CENTER_MASS / distSQ;

			// acceleration with direction
			const ax = gForce * dx / dist; // cos(theta)
			const ay = gForce * dy / dist; // sin(theta)

			// hide it if too close
			if (dist <= 10) p.state.opacity = 0;
			p.state.vx += ax / mass;
			p.state.vy += ay / mass;

			continue;

		}

		ctx.globalAlpha = 1;
		p.state.opacity = 1;

		// push
		const dx = x - cx;
		const dy = y - cy;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const minDist = 100;

		if (dist < minDist) {

			// similar to collision
			const theta = Math.atan2(dy, dx);
			tx = cx + Math.cos(theta) * minDist;
			ty = cy + Math.sin(theta) * minDist;

			p.state.x += (tx - x) * .075;
			p.state.y += (ty - y) * .075;

		}

	}

}


export default pushAndPull;
