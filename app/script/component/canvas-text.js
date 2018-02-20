window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

// let canvas = document.getElementById('stage'),
//   ctx = canvas.getContext("2d"),
//   w = canvas.width = window.innerWidth,
//   h = canvas.height = window.innerHeight,
//   logoParticles = [],
//   bgParticles = [],
//   particleIndex = 0,
//   logo = new Image(),
//   hue = 0;

window.addEventListener('DOMContentLoaded', (e) => {

	init();

}, false);

let stage = document.getElementById('stageCanvas'),
	ctx = stage.getContext('2d'),
	textCanvas = document.getElementById('textCanvas'),
	textCtx = textCanvas.getContext('2d'),
	particleSize = 8,
	particles = [];


// input ui
const inputText = document.getElementById('input-text'),
	inputRange = document.getElementById('input-range'),
	rangeLabel = document.getElementById('label-range');

/*
  Particle
 */
const Particle = function (x, y, ctx) {
	this.x = x;
	this.y = y;
	this.r = particleSize * .5;
	this.ctx = ctx;

}

Particle.prototype = {
	constructor: Particle,
	update: function () {

		const { ctx, x, y, r } = this;

		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();

	}
};

const init = () => {

	textCanvas.width = stage.width = window.innerWidth;
	textCanvas.height = stage.height = 200;

	inputText.addEventListener('input', (e) => {

		console.log(inputRange.value);

		textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
		textCtx.font = inputRange.value + 'px Arial';
		textCtx.textBaseline = 'top';
		textCtx.fillText(e.target.value.toUpperCase(), 0, 0);

		const imageData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height),
			pixels = imageData.data;

		particles = [];

		for (let y = 0, len = imageData.height; y < len; y += particleSize) {

			for (let x = 0, len2 = imageData.width; x < len2; x += particleSize) {

				//TODO, see how to get alpha change from pixels
				const alpha = pixels[((imageData.width * y) + x) * 4 + 3];

				if (alpha > 0) {
					particles.push(new Particle(x, y, ctx));
				}
			}
		}

	}, false);


	inputRange.addEventListener('input', (e) => {

		textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
		ctx.clearRect(0, 0, stageCanvas.width, stageCanvas.height);
		particles = [];
		inputText.value = '';

		rangeLabel.innerHTML = 'font size ' + e.target.value + 'px';

	}, false);


	setTimeout(() => { update() }, 1000);

};



//update particles
const update = () => {
	ctx.clearRect(0, 0, stageCanvas.width, stageCanvas.height);

	particles.forEach((p, i) => {
		p.update();
	});

	window.requestAnimationFrame(update);
};
