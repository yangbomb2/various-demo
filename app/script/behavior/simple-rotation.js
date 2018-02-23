
/**
 * Simple Rotation(Sprial)
 */

const angleVec = Math.PI * 2 / 360;

const simpleRotation = (particles, center, rotateFast = false) => {

	for (let i = 0; i < particles.length; ++i) {

		const p = particles[i];

		const { id, x, y, rotation } = p.state;

		// center coord
		const cx = center.x;
		const cy = center.y;

		// distance
		const dx = x - cx;
		const dy = y - cy;

		// radius
		const r = id * 1.25;
		const newAngle = rotation + (angleVec * id * 10);

		// get tx, ty
		const tx = cx + Math.cos(newAngle) * r;
		const ty = cy + Math.sin(newAngle) * r;

		// easing
		p.state.x += (tx - x) * .07;
		p.state.y += (ty - y) * .07;

		// rotate
		p.state.rotation -= rotateFast ? .05 : .005;

		p.update();

	}

}

export default simpleRotation;
