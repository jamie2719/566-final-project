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
    // TODO: pass proper data into gbuffers
    // Presently, the provided shader passes "nothing" to the first
    // two gbuffers and basic color to the third.

    // vec3 col = texture(tex_Color, fs_UV).rgb;

    // // if using textures, inverse gamma correct
    // col = pow(col, vec3(2.2));
    
    // store fs_Pos in this later

    //fragColor = vec4(0.0, 1.0, 0.0, 1.0);
    vec4 Pos_SS = u_viewProjOrthoMat * u_Model * fs_Pos;
    Pos_SS /= Pos_SS.w;
    fragmentdepth = vec4(Pos_SS.z);
}
