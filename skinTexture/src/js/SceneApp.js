// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

const size = 1024;

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		// this._bAxis.draw();
		// this._bDots.draw();

		let i = 8;
		let s = size / 4;

		while(i--) {
			let x = (i % 4) * s;
			let y = Math.floor(i/4) * s;

			GL.viewport(x, y, s, s);
			this._bCopy.draw(Assets.get(`r0${i+1}`));

			y = Math.floor(i/4) * s + size/2;

			GL.viewport(x, y, s, s);
			this._bCopy.draw(Assets.get(`b0${i+1}`));
		}
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;

		
		GL.setSize(size, size);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;