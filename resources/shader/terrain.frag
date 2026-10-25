#version 300 es
precision highp float;

uniform ivec2 viewportSize;
uniform mat4 modelView;
uniform mat4 projection;
uniform float time;
uniform sampler2D samplerImage;

centroid in float outDistance;
centroid in vec2 outUv;

out vec4 color;

float fogStart = 1.0;
float fogEnd = 20.0;
vec4 fogColor = vec4(0.9, 0.85, 0.9, 1.0);

void main() {
	vec4 samplerColor = texture(samplerImage, outUv);

	if (samplerColor.a < 0.01) {
		discard;
	}

	float fogFactor = clamp((fogEnd - outDistance) / (fogEnd - fogStart), 0.0, 1.0);

	color = mix(fogColor, samplerColor, fogFactor);
}
