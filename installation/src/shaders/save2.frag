// save.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec3 vColor;
varying vec3 vNormal;

void main(void) {
    gl_FragData[0] = vec4(vColor, 1.0);
    gl_FragData[1] = vec4(0.0, 0.0, 0.0, 1.0);
    gl_FragData[2] = vec4(vNormal, 1.0);
}