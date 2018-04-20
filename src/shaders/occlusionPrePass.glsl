#version 300 es
precision highp float;

in vec2 fs_UV;
out vec4 out_Col;

const float PI = 3.14159265359;

uniform sampler2D u_frame;
uniform vec2 u_Dimensions;
uniform float u_Time;

uniform vec4 u_LightPos;

uniform mat4 u_invViewProjMatrix;
uniform vec4 u_CamPos;


// Interpolation between color and greyscale over time on left half of screen
void main() {

    vec3 outColor = vec3(0.0);
    // convert fragment coordinates to normalized device coordinates
    vec2 ndc = (fs_UV) * 2.0 - 1.0; // -1 to 1 NDC

    vec4 p = vec4(ndc.xy, 1, 1); // Pixel at the far clip plane
    p *= 1000.0; // Times known value of camera's far clip plane value so it draws behind everything in world
    p = u_invViewProjMatrix * p; // Convert from unhomogenized screen to world space so that we can get the ray from the
    // eye to the point on the far clip plane of the frustrum

    vec3 rayDir = normalize(p.xyz - u_CamPos.xyz); // get the ray from the camera to point on far clip plane
    float sunSize = 20.0;
    vec3 sunDir = normalize(u_LightPos.xyz);
    float angle = acos(dot(rayDir, sunDir)) * 360.0 / PI;

    if(angle < sunSize) {
        out_Col = vec4(1.0);
        return;
    }

    out_Col = texture(u_frame, fs_UV);
}
