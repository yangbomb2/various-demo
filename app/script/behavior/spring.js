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

const spring = (ctx, color, p, target) => {

	p.state.freeMove = false;
	p.state.moveWithTargetPosition = false;

	const {x:tx, y:ty} = target;
	let { x, y, vx, vy } = p.state;
	const r = p.props.r;

	// dist
	const dx = x - tx;
	const dy = y - ty;

	// fixed pos with SPRING_LENGTH as Radius(dist)
	const angle = Math.atan2(dy, dx);
	const tx2 = tx + Math.cos(angle) * r;
	const ty2 = ty + Math.sin(angle) * r;

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
	if (!target.head) {

		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.lineWidth = r;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.moveTo(tx, ty);
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

}

export default spring;
