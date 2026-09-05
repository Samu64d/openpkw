#version 300 es
precision highp float;

uniform mat4 modelView;
uniform mat4 projection;
uniform float time;
uniform sampler2D samplerImage;

in vec2 outUv;

out vec4 FragColor;

void main() {
	FragColor = texture(samplerImage, outUv);
}
