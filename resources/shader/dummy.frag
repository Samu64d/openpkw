#version 300 es
precision highp float;

uniform mat4 modelView;
uniform mat4 projection;
uniform float time;
uniform sampler2D samplerImage;

in vec2 outUv;

out vec4 FragColor;

void main() {
	float r = (cos(time) * outUv.x + 1.0) / 2.0;
	float b = (sin(time) * outUv.y + 1.0) / 2.0;
	FragColor = texture(samplerImage, outUv) * vec4(r, 0.9, b, 1.0);
}
