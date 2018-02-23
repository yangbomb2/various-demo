
/**
 * Shoaling
 *
 * Rules:
 * Sepration
 * Alignment
 * Cohesion
 *
 *
 * https://cs.stanford.edu/people/eroberts/courses/soco/projects/2008-09/modeling-natural-systems/boids.html
 * https://www.red3d.com/cwr/boids/
 * https://p5js.org/examples/simulate-flocking.html
 *
 * @param {Boid} b
 * @param {*} center
 */
const shoaling = (p1, p2, center) => {

	p1.state.x += p1.state.vx;
	p1.state.y += p1.state.vy;

	// focal boid test
	if (p1.props.id === 0) {

		p1.state.isFocalBoid = true;

	}


};

export default shoaling;
