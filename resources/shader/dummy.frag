#version 300 es
precision highp float;

uniform ivec2 viewportSize;
uniform mat4 modelView;
uniform mat4 projection;
uniform float time;
uniform sampler2D samplerImage;

centroid in vec2 outUv;

out vec4 color;

void main() {
	color = texture(samplerImage, outUv);

	if (color.a < 0.01) {
		discard;
	}
}
