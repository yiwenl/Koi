// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import KoiSimulation from './KoiSimulation';
import KoiSimulation2 from './KoiSimulation2';
import ViewFloor from './ViewFloor';
import ViewFish from './ViewFish';
import ViewDebug from './ViewDebug';

let TARGET_SERVER_IP = 'localhost';
let socket = require('./libs/socket.io-client')(TARGET_SERVER_IP + ':9876');	
window.socket = socket;

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.rx.limit(0.2, Math.PI / 2);
		this.orbitalControl.rx.value = Math.PI * 0.5;
		this.orbitalControl.radius.value = 5;
		// this.orbitalControl.radius.limit(5, 10);

		this._koiSim = new KoiSimulation();
		this._koiSim2 = new KoiSimulation2();



		//	shadow map
		this._cameraLight = new alfrid.CameraOrtho();
		const s = 5;
		this._cameraLight.ortho(-s, s, -s, s, 1, 50);
		// this._cameraLight.lookAt([0, 10, 0], [0, 0, 0], [0, 0, -1]);
		const shift = 2;
		this._cameraLight.lookAt([shift, 10, shift], [0, 0, 0], [0, 1, 0]);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);



		alfrid.Scheduler.delay(()=> {
			gui.add(Config, 'numParticles', 1, 32).name('Number of fishes').step(1).onFinishChange(Settings.reload);
			gui.add(Config.fish, 'uFishScale', 0, 2).name('Fish Scale').onChange(Settings.refresh);
			gui.addColor(Config.fish, 'uColor').name('Fish Color').onChange(Settings.refresh);
			gui.add(Config.simulation, 'uDrawDistance', 0, 5).onChange(Settings.refresh);
			gui.add(Config.simulation, 'uDrawForce', 0, 10).onChange(Settings.refresh);
			gui.add(Config.simulation, 'uFishCapY', 0, 1).onChange(Settings.refresh);

			gui.add(Config.simulation, 'uRadius', 0, 5).onChange(Settings.refresh);
			gui.add(Config.simulation, 'uMinThreshold', 0, 1).onChange(Settings.refresh);
			gui.add(Config.simulation, 'uMaxThreshold', 0, 1).onChange(Settings.refresh);

			gui.add(Config, 'hideFloor').onChange(Settings.refresh);
		}, null, 500);


		//	touch detection

		this._hit = vec3.create();
		this._touch = vec3.create();
		this._center = vec3.create();

		// const detector = new TouchDetector(this._vFloor.mesh, this.camera);
		this._touchForce = new alfrid.EaseNumber(0, 0.01);
		// detector.on('onHit', (e) => {
		// 	vec3.copy(this._hit, e.detail.hit);
		// 	vec3.copy(this._touch, e.detail.hit);
		// 	this._hit[1] += 1;
		// 	this._touchForce.value = 1;
		// });

		// detector.on('onUp', (e) => {
		// 	vec3.set(this._hit, 999, 999, 999);
		// 	vec3.set(this._touch, 999, 999, 999);
		// 	this._touchForce.value = 0;
		// });


		socket.on('position', (o)=>{
			const r = Config.maxRadius * 0.5;
			vec3.set(this._hit, o.x * r, 1, o.y * r);
			vec3.set(this._touch, o.x * r, 1, o.y * r);
			this._touchForce.value = 1;
		});


		socket.on('useTexture', () => {
			Config.useSolidColor = false;
		});

		socket.on('useColor', () => {
			Config.useSolidColor = true;
		});

		socket.on('changeColor', () => {
			this._vFishes.changeColor();
		});
	}

	_initTextures() {
		console.log('init textures');
		const shadowMapSize = GL.isMobile ? 1024 : 2048;
		this._fboShadow = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vFloor = new ViewFloor();
		this._vFishes = new ViewFish();
		this._vDebug = new ViewDebug();
	}


	renderShadow() {
		//	update shadow matrix
		//	copy touch.xz to camera.xz
		//	move floor.xz to touch.xz
		
		this._fboShadow.bind();
		GL.clear(1, 0, 0, 1);
		GL.setMatrices(this._cameraLight);
		// this._vFishes.render(this._koiSim.texture, this._koiSim.textureExtra);
		this._fboShadow.unbind();

	}


	render() {
		//	update fish position
		this._koiSim.update(this._hit, this._touchForce.value, this._center);
		this._koiSim2.update(this._hit, this._touchForce.value, this._center);

		this.renderShadow();

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		// this._vFishes.render(this._koiSim.texture, this._koiSim.textureExtra);
		this._vFishes.render(this._koiSim2.texturePos, this._koiSim2.textureExtra, this._koiSim2.textureVel);
		
		

		// this._vDebug.render(this._koiSim2.texturePos);

		let s = 0.1 * this._touchForce.value;
		this._bBall.draw(this._touch, [s, s, s], [1, 1, 1]);


		s = 200;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._koiSim2.texturePos);
		
		GL.viewport(s, 0, s, s);
		this._bCopy.draw(this._koiSim2.textureExtra);

		// s = Config.numParticles * 4;
		// GL.viewport(0, 0, s * 2, s);
		// this._bCopy.draw(this._koiSim.texture);
		// GL.viewport(s*2, 0, s, s);
		// this._bCopy.draw(this._koiSim.textureExtra);
		// s = 256;
		// GL.viewport(0, 0, s, s);
		// this._bCopy.draw(this._fboShadow.getTexture());
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;