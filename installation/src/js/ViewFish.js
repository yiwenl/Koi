// ViewFish.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import vs from 'shaders/fishes.vert';
import fs from 'shaders/fishes.frag';
import getColorTheme from 'get-color-themes';


var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewFish extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const uvs = [];
		const uvOffset = [];
		const colors = [];

		const { numParticles:num } = Config;
		const n = 4;
		const r = 0.1;

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				let uv = [i/num, j/num];
				uvs.push(uv);

				let t = Math.floor(Math.random() * 16);
				let u = (t % n) / n;
				let v = Math.floor(t / n) / n;

				u += random(-r, r);
				v += random(-r, r);

				uvOffset.push([u, v, Math.random()]);
			}
		}

		this.mesh = Assets.get('fish');
		this.mesh.bufferInstance(uvs, 'aUV');
		this.mesh.bufferInstance(uvOffset, 'aUVOffset');

		this.textureSkin = Assets.get('ink');
		this.textureSkin.minFilter = this.textureSkin.magFilter = GL.LINEAR_MIPMAP_NEAREST;
		this.textureSkin.wrapS = this.textureSkin.wrapT = GL.MIRRORED_REPEAT;

		this.changeColor()

		setTimeout(()=> {
			gui.add(this, 'changeColor');
			gui.add(Config, 'useSolidColor');
		}, 500)
	}

	changeColor() {
		const colorThemes = getColorTheme();
		console.log('colorThemes', colorThemes);

		const colors = [];

		colorThemes.forEach( c => {
			colors.push(c[0], c[1], c[2]);
		})

		this.shader.bind();
		this.shader.uniform("uColors", "vec3", colors);
	}


	render(texture, textureExtra, textureVel) {
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);
		this.shader.uniform("uSolidColor", "float", Config.useSolidColor ? 1.0 : 0.0);

		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureExtra", "uniform1i", 1);
		textureExtra.bind(1);

		this.shader.uniform("textureSkin", "uniform1i", 2);
		this.textureSkin.bind(2);

		this.shader.uniform("textureVel", "uniform1i", 3);
		textureVel.bind(3);

		this.shader.uniform(Config.fish);
		GL.draw(this.mesh);
	}


}

export default ViewFish;