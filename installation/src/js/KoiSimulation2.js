// KoiSimulation2.js

import alfrid, { GL, CameraOrtho } from 'alfrid';
import { FboPingPong } from './utils';
import Config from './Config';

import vsSave from 'shaders/save2.vert';
import fsSave from 'shaders/save2.frag';

import fsSim from 'shaders/flocking2.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class KoiSimulation2 {

	constructor() {
		const { numParticles } = Config;	

		this._fbo = new FboPingPong(numParticles, numParticles, {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		}, 3);		


		const _fsFlock = fsSim.replace('${NUM}', Config.numParticles);
		this.shader = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, _fsFlock);
		this.meshTri = alfrid.Geom.bigTriangle();

		this._savePositions();
	}	


	_savePositions() {
		const { numParticles:num, maxRadius } = Config;

		const shader = new alfrid.GLShader(vsSave, fsSave);
		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const getPos = () => {
			const r = maxRadius * 0.25;
			return [random(-r, r), -1.5, random(-r, r)];
		}

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				positions.push(getPos());
				normals.push([Math.random(), Math.random(), Math.random()]);
				uvs.push([i/num, j/num]);
				indices.push(count);
				count++;
			}
		}

		const mesh = new alfrid.Mesh(GL.POINTS);
		mesh.bufferVertex(positions);
		mesh.bufferTexCoord(uvs);
		mesh.bufferNormal(normals);
		mesh.bufferIndex(indices);


		this._fbo.read.bind();
		GL.clear(0, 0, 0, 0);
		shader.bind();
		GL.draw(mesh);
		this._fbo.read.unbind();
	}


	update(mHit, mHitForce, mCenter) {
		this._fbo.write.bind();
		GL.clear(0, 0, 0, 0);

		this.shader.bind();
		this.shader.uniform("texturePos", "uniform1i", 0);
		this._fbo.read.getTexture(0).bind(0);

		this.shader.uniform("textureVel", "uniform1i", 1);
		this._fbo.read.getTexture(1).bind(1);

		this.shader.uniform("textureExtra", "uniform1i", 2);
		this._fbo.read.getTexture(2).bind(2);

		this.shader.uniform("uMaxRadius", "float", Config.maxRadius);
		GL.draw(this.meshTri);
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);

		this.shader.uniform("uHit", "vec3", mHit);
		this.shader.uniform("uHitForce", "float", mHitForce);
		this.shader.uniform(Config.simulation);
		this.shader.uniform("uCenter", "vec3", mCenter);

		GL.draw(this.meshTri);

		this._fbo.write.unbind();
		this._fbo.swap();
	}


	get texturePos() {
		return this._fbo.read.getTexture(0);
	}

	get textureVel() {
		return this._fbo.read.getTexture(1);
	}

	get textureExtra() {
		return this._fbo.read.getTexture(2);
	}


}

export default KoiSimulation2;