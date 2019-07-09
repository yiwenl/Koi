#extension GL_EXT_draw_buffers : require 
precision highp float;

#define NUM ${NUM}

varying vec2 vTextureCoord;
uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureExtra;

uniform float uMaxRadius;
uniform float uTime;
uniform vec3 uHit;
uniform float uHitForce;
uniform float uDrawDistance;
uniform float uDrawForce;
uniform float uFishCapY;
uniform float uRadius;
uniform float uMinThreshold;
uniform float uMaxThreshold;
uniform vec3 uCenter;


#define PI 3.141592653
#pragma glslify: curlNoise = require(./fragments/curlNoise.glsl)

void main(void) {
	vec3 pos = texture2D(texturePos, vTextureCoord).xyz;
	vec3 vel = texture2D(textureVel, vTextureCoord).xyz;
	vec3 extra = texture2D(textureExtra, vTextureCoord).xyz;

	float posOffset = 0.25;
	float time = mod(uTime * 0.1, 1.0);
	vec3 acc = curlNoise(vec3(pos.xz * posOffset, time)) * 0.25;
	acc.y *= 0.01;

	vec2 uvParticle;
	vec3 posParticle, velParticle, dir;
	float _num = float(NUM);
	float dist, p, f;

	for(int i=0; i<NUM; i++) {
		for(int j=0; j<NUM; j++) {
			uvParticle = vec2(float(i) / _num, float(j)/_num);
			posParticle = texture2D(texturePos, uvParticle).xyz;
			velParticle = texture2D(textureVel, uvParticle).xyz;

			dir = posParticle - pos;
			dist = length(dir);

			if(dist < uRadius && dist > 0.0) {

				dir = normalize(dir);	
				p = dist / uRadius;

				if(p < uMinThreshold) {	//	repel
					f = 1.0 / p;
					acc -= dir * f * 0.05;
				} else if( p < uMaxThreshold) {
					p = ( p - uMinThreshold) / (uMaxThreshold - uMinThreshold);	
					f = sin(p * PI);
					dir = mix(vel, velParticle, f * 0.5);
					if(length(dir) > 0.0) {
						acc += normalize(dir) * 0.01;	
					}
				} else {
					p = ( p - uMaxThreshold) / (1.0 - uMaxThreshold);
					f = sin(p * PI);
					acc += dir * f * 0.01;
				}
			}
		}
	}



	//	prevent go over surface
	f = smoothstep(-0.5, 0.0, pos.y);
	acc.y -= f * 2.0;

	f = smoothstep(-1.0, -2.0, pos.y);
	acc.y += f;
	

	//	pulling force to touch
	float d = distance(pos, uHit);
	f = smoothstep(uDrawDistance, 0.0, d);
	f = sin(f * PI);
	dir = normalize(pos - uHit);
	acc -= dir * uDrawForce * f * uHitForce;	


	//	prevent going over
	d = distance(pos.xz, uCenter.xz);
	float r = uMaxRadius * 0.25;
	if(d > r) {
		float f = (d - r) * 0.7;
		vec2 dir = normalize(pos.xz);
		acc.xz -= dir * f;
	}

	float speed = mix(extra.b, 1.0, .14);
	vel += acc * 0.002 * speed;

	float decreaseRate = 0.99;
	vel *= decreaseRate;

	float maxSpeed = 0.5;
	if(length(vel) > maxSpeed) {
		vel = normalize(vel) * maxSpeed;
	} 

	pos += vel;

	gl_FragData[0] = vec4(pos, 1.0);
	gl_FragData[1] = vec4(vel, 1.0);
	gl_FragData[2] = vec4(extra, 1.0);
}