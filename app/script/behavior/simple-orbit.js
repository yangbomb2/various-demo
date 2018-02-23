/**
 * Simple oribiting based on centerX, centerY
 *
 * @param  {Object} p [Particle]
 */

// simple rotation
const angleInc = .01;
const cos = Math.cos(angleInc);
const sin = Math.sin(angleInc);

const simpleOrbit = (particles, center) => {

	for (let i = 0; i < particles.length; ++i) {

		const p = particles[i];
		const { id, x, y, freeMove, angle } = p.state;

		// get tx, ty from the center x, center y
		// get distance x, y
		const dx = x - center.x;
		const dy = y - center.y;
		const dist = Math.sqrt(dx * dx, dy * dy);

		// the further away, the faster it orbit around center
		const angleInc = ((dist / center.x) + 1) * .05 // .005 ~ 0.01;
		// const cos = Math.cos(angleInc);
		// const sin = Math.sin(angleInc);
		const x1 = (cos * dx - sin * dy);
		const y1 = (cos * dy + sin * dx);

		const tx = center.x + x1;
		const ty = center.y + y1;

		p.state.x = tx;
		p.state.y = ty;

		p.update();

	}

}

export default simpleOrbit;
