/**
 * Web
*/

// https://konvajs.github.io/docs/
// import Konva from 'konva';

const SPRING = .03;
const FRICTION = .85;

const grid = (particles, grid, boundary, mousePoistion, ctx, range = 200, magnitude = .3) => {

	const { top, right, bottom, left } = boundary;
	const { col, row } = grid;

	// get row based on fixed col

	// each grid unit
	for (let i = 0; i < particles.length; ++i) {

		const p0 = particles[i]; // self | top left
		let p1; // top right
		let p2; // bottom right
		let p3; // bottom left

		// grid x, y
		// i.g (0,0) (0,1)...
		const {
			gridPosition: { x: gx0, y: gy0, w, h },
			x,
			y,
		} = p0.state;

		// dist between grid position(not the current position) and mouse position

		// simple trigometry
		const dx = (gx0 * w) - mousePoistion.x;
		const dy = (gy0 * h) - mousePoistion.y;
		const distSQ = dx * dx + dy * dy;
		const dist = Math.sqrt(distSQ);
		const phi = Math.atan2(dy, dx);
		const withinRange = dist < range;
		const proximity = magnitude + (dist / range * (1 - magnitude)); // .5 ~ 1

		let tx;
		let ty;

		// witin range(== min dist)
		if (withinRange) {

			// min + percent with magnitude
			const radius = range * proximity;

			tx = mousePoistion.x + Math.cos(phi) * radius;
			ty = mousePoistion.y + Math.sin(phi) * radius;

			// ctx.rect(gx0 * w, gy0 * h, 100, 100);
			// ctx.rect(x, y, 100, 100);
			// ctx.fill();
			// p1, p2, p3

		} else {

			tx = gx0 * w;
			ty = gy0 * h;

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
		ctx.beginPath();

		for (let j = i; j < particles.length; j++) {

			const n = particles[j];
			const { x: gx1, y: gy1 } = n.state.gridPosition;

			if (gx1 - gx0 === 1 && gy1 - gy0 === 0 ||
				gx1 - gx0 === 0 && gy1 - gy0 === 1) {

				ctx.strokeStyle = withinRange ? 'rgba(239,96,96,.25)' : 'rgba(33,33,33,.25)';
				ctx.lineWidth = withinRange ? 1 : .5;

				ctx.moveTo(p0.state.x, p0.state.y);
				ctx.lineTo(n.state.x, n.state.y);

			}

			// get the rest of points(n + 1, n + 2, n + 3)
			if (gx1 - gx0 === 1 && gy1 - gy0 === 0) p1 = n; // top right
			if (gx1 - gx0 === 1 && gy1 - gy0 === 1) p2 = n; // bottom right
			if (gx1 - gx0 === 0 && gy1 - gy0 === 1) p3 = n; // bottom right

		}

		// lines end
		// fill
		if (withinRange && p1 && p2 && p3) {

			// single color
			// ctx.fillStyle = `rgba(239,96,96, ${1 - proximity})`;

			// use canvas gradient
			// gradient ref
			// https://digitalsynopsis.com/design/beautiful-color-gradients-backgrounds/
			const gradient = ctx.createLinearGradient(left, top, right, bottom);
			gradient.addColorStop(0, `rgba(255,236,210,${1 - proximity})`); // #ffecd2
			gradient.addColorStop(.5, `rgba(150,222,210,${1 - proximity})`); // #ffecd2
			gradient.addColorStop(1, `rgba(252,182,159,${1 - proximity})`); // #fcb69f
			ctx.fillStyle = gradient;

			// ctx.fillStyle = 'red';
			ctx.moveTo(p0.state.x, p0.state.y);
			ctx.lineTo(p1.state.x, p1.state.y);
			ctx.lineTo(p2.state.x, p2.state.y);
			ctx.lineTo(p3.state.x, p3.state.y);
			ctx.fill();

		}

		ctx.stroke();

	}

}

// with konva.
// not using this.
const gridKonva = (stage, grid, boundary, mousePoistion) => {

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
		const gx0 = i % (col + 1);
		const gy0 = Math.floor(i / (col + 1));

		// update x, y position
		if (!node.dragging) {

			// original position
			node.position({
				x: gx0 * w,
				y: gy0 * h,
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

				const gx1 = j % (col + 1);
				const gy1 = Math.floor(j / (col + 1));

				if (Math.abs(gx0 - gx1) === 1 && gy0 - gy1 === 0 ||
					gx0 - gx1 === 0 && Math.abs(gy0 - gy1) === 1) {

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
