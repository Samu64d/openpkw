#version 300 es
precision highp float;

uniform mat4 modelView;
uniform mat4 projection;
uniform float time;
uniform sampler2D samplerImage;

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;

out vec2 outUv;

void main() {
   gl_Position = projection * modelView * vec4(position, 1.0);
   outUv = uv;
}
