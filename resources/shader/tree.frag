#version 300 es
precision highp float;

uniform ivec2 viewportSize;
uniform mat4 modelView;
uniform mat4 projection;
uniform float time;
uniform sampler2D samplerImage;

centroid in float outDistance;
centroid in vec2 outUv;

out vec4 outColor;

float ambientLightStrength = 0.15;
vec4 ambientLightColor = vec4(0.9, 0.9, 0.95, 1.0);
float fogStart = 1.0;
float fogEnd = 5.0;
vec4 fogColor = vec4(0.9, 0.85, 0.9, 1.0);

void main() {
	vec4 samplerColor = texture(samplerImage, outUv);

	if (samplerColor.a < 0.01) {
		discard;
	}

	vec4 ambientSamplerColor = mix(samplerColor, ambientLightColor, ambientLightStrength);
	float fogFactor = clamp((outDistance - fogStart) / (fogEnd - fogStart), 0.0, 1.0);

	outColor = mix(ambientSamplerColor, fogColor, fogFactor);
}
