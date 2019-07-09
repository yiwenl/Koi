// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vNormal;
varying vec3 vColor;

void main(void) {
	vec2 pos    = aTextureCoord * 2.0 - 1.0;
	gl_Position = vec4(pos, 0.0, 1.0);
	vNormal     = aNormal;
	vColor      = aVertexPosition;
}