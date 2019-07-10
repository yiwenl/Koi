// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE


precision highp float;
varying vec3 vDebug;
varying vec3 vNormal;
varying vec2 vTextureCoord;
varying vec3 vUVOffset;
varying vec3 vColor;

uniform vec3 uColor;
uniform sampler2D textureSkin;

uniform float uSolidColor;


#define USE_COLORMAP 1
#define DARK_BLUE vec3(32.0, 35.0, 40.0)/255.0


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float luma(vec4 color) {
  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}


#define LIGHT  vec3(0.0, 1.0, 0.0)
#define PI 3.141592653

void main(void) {
	float d      = diffuse(vNormal, LIGHT);

	vec2 uv = rotate(vTextureCoord, vUVOffset.z * PI * 2.0);
	uv = uv * 0.25 + vUVOffset.xy;
	vec4 color = texture2D(textureSkin, uv);
	color.rgb = mix(color.rgb, vColor, uSolidColor);

	d = mix(d, 1.0, .8);
	color.rgb *= d;


	gl_FragColor = color;

}