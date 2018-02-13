
/**
 * Simple Rotation(Sprial)
 */

const angleVec = Math.PI * 2 / 360;

const simpleRotation = (p, center, particleLength, rotateFast = false) => {

	const { x, y, freeMove, rotation } = p.state;
	const { id } = p.props;

	p.state.freeMove = false;
	p.state.moveWithTargetPosition = true;

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

	p.state.tx = tx;
	p.state.ty = ty;

	// rotate
	p.state.rotation -= rotateFast ? .05 : .005;

}

export default simpleRotation;
