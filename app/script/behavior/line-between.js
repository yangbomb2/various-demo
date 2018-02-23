/**
 * Distance calculator between two particles
 * @param {*} p1
 * @param {*} p2
 * @param {*} minDist
 */
export default (particles, ctx, minDist) => {

	for (let i = 0; i < particles.length; ++i) {

		const p1 = particles[i];

		// update x, y
		const { vx, vy } = p1.state;
		p1.state.x += vx;
		p1.state.y += vy;

		p1.update();

		for (let j = i + 1; j < particles.length; ++j) {

			const p2 = particles[j];
			const dx = p2.state.x - p1.state.x;
			const dy = p2.state.y - p1.state.y;
			const dist = Math.sqrt(dx * dx + dy * dy);

			// Draw the line when distance is smaller
			// then the minimum distance
			if (dist < minDist) {

				const proxmity = dist / minDist; // 0 ~ 1

				// Draw the line
				ctx.beginPath();

				ctx.strokeStyle = `rgba(1,1,1, ${1 - proxmity})`;
				ctx.lineWidth = (proxmity * .5) + .5; // 0.5 ~ 1

				ctx.moveTo(p1.state.x, p1.state.y);
				ctx.lineTo(p2.state.x, p2.state.y);
				ctx.stroke();

				ctx.closePath();

			}

		}


	}

}
