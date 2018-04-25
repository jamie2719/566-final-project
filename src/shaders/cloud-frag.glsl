#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec2 fs_UV;
in float fs_Type;

uniform mat4 u_Model;
uniform mat4 u_Proj;
uniform mat4 u_View; 
uniform mat4 u_ModelInvTr;  

uniform vec3 u_LightPos;
out vec4 fragColor[4]; // The data in the ith index of this array of outputs
                       // is passed to the ith index of OpenGLRenderer's
                       // gbTargets array, which is an array of textures.
                       // This lets us output different types of data,
                       // such as albedo, normal, and position, as
                       // separate images from a single render pass.

void main() {

    // pass white to this pixel for the cloud
    fragColor[3] = vec4(1.0,1.0, 1.0, fs_Type);

}
