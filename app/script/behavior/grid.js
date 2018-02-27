/**
 * Web
*/

// https://konvajs.github.io/docs/
import Konva from 'konva';

const SPRING = .03;
const FRICTION = .85;

const grid = (particles, grid, boundary, mousePoistion, ctx, range = 200, magnitude = .3) => {

	const { top, right, bottom, left } = boundary;
	const { col, row } = grid;

	// get row based on fixed col

	// each grid unit
	for (let i = 0; i < particles.length; ++i) {

		const p0 = particles[i];

		// grid x, y
		// i.g (0,0) (0,1)...
		const {
			gridPosition: { x: x0, y: y0, w, h},
			x,
			y,
		} = p0.state;

		// dist between grid position(not the current position) and mouse position

		// simple trigometry
		const dx = (x0 * w) - mousePoistion.x;
		const dy = (y0 * h) - mousePoistion.y;
		const distSQ = dx * dx + dy * dy;
		const dist = Math.sqrt(distSQ);
		const phi = Math.atan2(dy, dx);
		const withinRange = dist < range;

		let tx;
		let ty;

		// witin range(== min dist)
		if (withinRange) {

			// min + percent with magnitude
			const proximity = magnitude + (dist / range * (1 - magnitude)); // .5 ~ 1
			const radius = range * proximity;

			tx = mousePoistion.x + Math.cos(phi) * radius;
			ty = mousePoistion.y + Math.sin(phi) * radius;

		} else {

			tx = x0 * w;
			ty = y0 * h;

		}

		/* TODO, this looks like a mesh effect
		const phi = Math.atan2(dy, dx);
		let proximity = dist / MIN_DIST;
		if (proximity < 1) proximity = 1;
		tx = mousePoistion.x + Math.cos(phi) * dist * (1 - proximity);
		ty = mousePoistion.y + Math.sin(phi) * dist * (1 - proximity);
		*/

		// apply spring
		// acceleration
		const ax = (tx - x) * SPRING;
		const ay = (ty - y) * SPRING;

		// velocity
		const vx = (p0.state.vx + ax) * FRICTION;
		const vy = (p0.state.vy + ay) * FRICTION;

		p0.state.vx = vx;
		p0.state.vy = vy;

		p0.state.x += vx;
		p0.state.y += vy;

		p0.state.collision = withinRange;

		p0.update();

		// draw lines to only adjcent neighbors
		// +- 1 on x,y axis
		for (let j = i; j < particles.length; j++) {

			const p1 = particles[j];
			const { x: x1, y: y1 } = p1.state.gridPosition;

			if (Math.abs(x0 - x1) === 1 && y0 - y1 === 0 ||
				x0 - x1 === 0 && Math.abs(y0 - y1) === 1) {

				ctx.beginPath();
				ctx.strokeStyle = withinRange ?  'rgba(239,96,96,.25)' : 'rgba(33,33,33,.25)';
				ctx.lineWidth = withinRange ? 1 : .5;

				ctx.moveTo(p0.state.x, p0.state.y);
				ctx.lineTo(p1.state.x, p1.state.y);

				ctx.stroke();
				ctx.closePath();

			}

		}


	}

}


// with konva.
// not using this.
const gridKonva = (stage, grid, boundary, mousePoistion) => {

	// console.log(stage);
	console.log(mousePoistion)

	// const nodeLayer = stage.find();
	const layer = stage.getLayers()[0];
	const nodes = layer.find('.node');

	const ctx = layer.getContext();

	// ctx.fillStyle = 'red';
	const { top, right, bottom, left } = boundary;
	const { col, row } = grid;

	// get row based on fixed col
	// each grid unit
	const w = Math.round(right / col);
	const h = Math.round(bottom / row);

	// nodes(shape)
	for (let i = 0; i < nodes.length; i++) {

		const node = nodes[i];

		// grid x, y
		const x0 = i % (col + 1);
		const y0 = Math.floor(i / (col + 1));

		// update x, y position
		if (!node.dragging) {

			// original position
			node.position({
				x: x0 * w,
				y: y0 * h,
			});

		} else {

			const pos = stage.getPointerPosition();

			node.position({
				x: pos.x,
				y: pos.y,
			});

			// draw lines to only adjcent neighbors
			// +- 1
			for (let j = i; j < nodes.length; j++) {

				const neighbor = nodes[j];

				const x1 = j % (col + 1);
				const y1 = Math.floor(j / (col + 1));

				if (Math.abs(x0 - x1) === 1 && y0 - y1 === 0 ||
					x0 - x1 === 0 && Math.abs(y0 - y1) === 1) {

					ctx.beginPath();
					ctx.strokeStyle = 'rgba(1,1,1,1)';
					ctx.lineWidth = .5;

					ctx.moveTo(node.x(), node.y());
					ctx.lineTo(neighbor.x(), neighbor.y());
					ctx.stroke();

					ctx.closePath();

				}

			}

		}

	}

	layer.batchDraw();

}

export default grid;
