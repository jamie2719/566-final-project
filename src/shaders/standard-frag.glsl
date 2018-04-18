#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec2 fs_UV;

uniform mat4 u_Proj;
uniform mat4 u_ModelInvTr;
uniform mat4 u_View;   

uniform vec3 u_LightPos;
out vec4 fragColor[3]; // The data in the ith index of this array of outputs
                       // is passed to the ith index of OpenGLRenderer's
                       // gbTargets array, which is an array of textures.
                       // This lets us output different types of data,
                       // such as albedo, normal, and position, as
                       // separate images from a single render pass.

uniform sampler2D tex_Color;
uniform mat4 u_mvpLight;


// model space vertex positions
in vec4 lightViewPos;
in vec4 cam_Pos;

void main() {
    // TODO: pass proper data into gbuffers
    // Presently, the provided shader passes "nothing" to the first
    // two gbuffers and basic color to the third.

    // fragment info is in view space
    mat3 invTranspose = mat3(u_ModelInvTr);
    mat3 view = mat3(u_View);
    
    vec4 Nor = vec4(view * invTranspose * fs_Nor.xyz, 0);

    vec3 col = texture(tex_Color, fs_UV).rgb;

    // if using textures, inverse gamma correct
    col = pow(col, vec3(2.2));
    vec4 projPos = (u_Proj * fs_Pos);
    float depth = projPos.z / projPos.w;
    // normal and depth value in w
    fragColor[0] = vec4(Nor.xyz, depth);
    // world pos and 1 for w since mesh overlaps

    fragColor[1] = vec4(fs_Pos.xyz, 1.0);
    // albedo
    fragColor[2] = vec4(col, 1.0);

   // fragColor[3] = vec4(1.0, 0.0, 1.0, 1.0);
}
