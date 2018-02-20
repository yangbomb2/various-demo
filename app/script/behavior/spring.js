/**
 * Spring
 */

// how fast it moves
const SPRING = .05;

// it needs to stop at some point;
// 0 ~ 1
// bigger the number is bigger spring effect
const FRICTION = .75;
const SPRING_LENGTH = 40;

const spring = (particles, mousePosition, ctx, color) => {

	for (let i = 0; i < particles.length; ++i) {

		const target = i === 0 ? mousePosition : {
			x: particles[i - 1].state.x,
			y: particles[i - 1].state.y,
		};

		const p = particles[i];

		let { x, y, vx, vy, r } = p.state;

		// dist
		const dx = x - target.x;
		const dy = y - target.y;

		// fixed pos with SPRING_LENGTH as Radius(dist)
		const angle = Math.atan2(dy, dx);
		const tx2 = target.x + Math.cos(angle) * r;
		const ty2 = target.y + Math.sin(angle) * r;

		// acceleration, dist based
		// farther, faster
		const ax = (tx2 - x) * SPRING;
		const ay = (ty2 - y) * SPRING;

		vx += ax;
		vy += ay;

		// apply friction so it can stop
		vx *= FRICTION;
		vy *= FRICTION;

		x += vx;
		y += vy;

		// line
		if (i !== 0) {

			ctx.beginPath();
			ctx.strokeStyle = `rgba(${color}, 1)`;
			ctx.lineWidth = r;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.moveTo(target.x, target.y);
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.closePath();

		}

		// update state
		Object.assign(p.state, {
			vx,
			vy,
			x,
			y,
		});

		p.update();

	}

}

export default spring;
