// ViewDebug.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/debug.vert';

class ViewDebug extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const { numParticles } = Config;
		const positions = [];
		const indices = [];
		let count = 0;

		for(let i=0; i<numParticles; i++) {
			for(let j=0; j<numParticles; j++) {
				positions.push([i/numParticles, j/numParticles, 0]);
				indices.push(count);

				count ++;
			}
		}

		
		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
	}


	render(texturePos) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texturePos.bind(0);
		this.shader.uniform("color", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", 1);
		GL.draw(this.mesh);
	}


}

export default ViewDebug;