#version 300 es
precision highp float;

uniform mat4 u_Model;

uniform mat4 u_viewProjOrthoMat;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec2 fs_UV;

layout(location = 0) out vec4 fragmentdepth;
//out vec4 fragColor; // The data in the ith index of this array of outputs
                       // is passed to the ith index of OpenGLRenderer's
                       // gbTargets array, which is an array of textures.
                       // This lets us output different types of data,
                       // such as albedo, normal, and position, as
                       // separate images from a single render pass.

void main() {

    vec4 Pos_SS = u_viewProjOrthoMat * u_Model * fs_Pos;
    Pos_SS /= Pos_SS.w;
    fragmentdepth = vec4(Pos_SS.z);
}
