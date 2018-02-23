/**
 * Gravitation
 * gravitational force:
 * G * m1 * m2 / distance * distance
 */

const gravitation = (p1, p2, minDist) => {

	// test gravigational force
	const dy = p2.state.y - p1.state.y;
	const dx = p2.state.x - p1.state.x;

	const distSQ = dy * dy + dx * dx;
	const dist = Math.sqrt(distSQ);

	const gForce = p1.props.mass * p2.props.mass / distSQ;
	const ax = gForce * dx / dist; // dx / dist === Math.cos(theta)
	const ay = gForce * dy / dist; // dy / dist === Math.sin(theta)

	p1.state.vx += ax / p1.props.mass;
	p1.state.vy += ay / p1.props.mass;

	p2.state.vx -= ax / p2.props.mass;
	p2.state.vy -= ay / p2.props.mass;

}
