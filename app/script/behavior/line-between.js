/**
 * Distance calculator between two particles
 * @param {*} p1
 * @param {*} p2
 * @param {*} minDist
 */
export default (p1, p2, minDist, ctx) => {

	p1.state.freeMove = true;
	p1.state.moveWithTargetPosition = false;

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
