/**
 * push-and-pull towrad mouse position
 * @param  {[type]} p [description]
 */

const pushAndPull = (p, center, pull, particleLength) => {

	const { x, y, move, rotation } = p.state;

	p.state.freeMove = false;
	p.state.moveWithTargetPosition = true;

	let r;
	let newRotation;

	const cx = center.x;
	const cy = center.y;

	if (pull) {

		// pull

		// radius
		const r = Math.random() * 150;
		const newRotation = rotation + Math.PI * 2 / particleLength * p.props.id;

		// get tx, ty
		const tx = cx + Math.cos(newRotation) * r;
		const ty = cy + Math.sin(newRotation) * r;

		p.state.tx = tx;
		p.state.ty = ty;

	} else {

		// push

		const dx = x - cx;
		const dy = y - cy;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const minDist = 50;

		if (dist < minDist) {

			// similar to collision
			const theta = Math.atan2(dy, dx);
			const tx = cx + Math.cos(theta) * minDist;
			const ty = cy + Math.sin(theta) * minDist;

			p.state.tx = tx;
			p.state.ty = ty;

		}

	}

}


export default pushAndPull;
