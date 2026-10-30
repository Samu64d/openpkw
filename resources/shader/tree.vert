#version 300 es
precision highp float;

uniform ivec2 viewportSize;
uniform mat4 modelView;
uniform mat4 projection;
uniform float time;
uniform sampler2D samplerImage;

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;

centroid out float outDistance;
centroid out vec2 outUv;

void main() {
	float waveX = sin(position.x + time * 1.5) * 0.03 * position.y;
	float waveZ = cos(position.z + time * 1.5) * 0.03 * position.y;
	vec3 wavedPosition = vec3(position.x + waveX, position.y, position.z + waveZ);
	vec4 modelViewPosition = modelView * vec4(wavedPosition, 1.0);

	gl_Position = projection * modelViewPosition;
	outDistance = -modelViewPosition.z;
	outUv = uv;
}
