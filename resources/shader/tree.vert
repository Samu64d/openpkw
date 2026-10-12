#version 300 es
precision highp float;

uniform ivec2 viewportSize;
uniform mat4 modelView;
uniform mat4 projection;
uniform float time;
uniform sampler2D samplerImage;

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;

centroid out vec2 outUv;

void main() {
	float waveX = sin(position.x + time) * 0.04 * position.y;
	float waveZ = sin(position.z + time) * 0.04 * position.y;

	vec3 position2 = vec3(position.x + waveX, position.y, position.z + waveZ);

    gl_Position = projection * modelView * vec4(position2, 1.0);
	outUv = uv;
}
