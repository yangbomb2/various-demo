/**
 * Simple collision
 * @param {*} p1
 * @param {*} p2
 * @param {*} minDist
 */

const simpleCollision = (p1, p2, minDist) => {

	// with free move
	p1.state.freeMove = true;
	p1.state.moveWithTargetPosition = false;

	const dx = p2.state.x - p1.state.x;
	const dy = p2.state.y - p1.state.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const theta = Math.atan2(dy, dx);
	const isColliding = dist < minDist;

	if (isColliding) {

		// set collision flag
		p1.state.vx *= -1;
		p1.state.vy *= -1;

		// move p2 from p1 with minDist
		p2.state.x = Math.cos(theta) * minDist + p1.state.x;
		p2.state.y = Math.sin(theta) * minDist + p1.state.y;

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

export default simpleCollision;
