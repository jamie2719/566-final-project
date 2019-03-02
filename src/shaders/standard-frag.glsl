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
out vec4 fragColor[3]; // The data in the ith index of this array of outputs
                       // is passed to the ith index of OpenGLRenderer's
                       // gbTargets array, which is an array of textures.
                       // This lets us output different types of data,
                       // such as albedo, normal, and position, as
                       // separate images from a single render pass.

uniform sampler2D tex_Color0; // alpaca
uniform sampler2D tex_Color1; // frame
uniform sampler2D tex_Color2; // wall
uniform sampler2D tex_Color3; // tree bark
uniform sampler2D tex_Color4; // leaf

void main() {

    // fragment info is in view space
    mat3 invTranspose = mat3(u_ModelInvTr);
    mat3 view = mat3(u_View);
    
    // do calculations in here to avoid vertices being cut off, per Jin
    vec4 Nor = vec4(view * invTranspose * fs_Nor.xyz, 0);
    vec4 pos = u_View * u_Model * fs_Pos;

    vec4 col;

    float epsilon = .001;
    if(fs_Type == 0.0) { //terrain
        col = texture(tex_Color0, fs_UV);
    } else if(abs(fs_Type - .1) < epsilon){
        col = texture(tex_Color1, fs_UV);
    } else if (abs(fs_Type - .2) < epsilon) {
        col = texture(tex_Color2, fs_UV);
    } else if (abs(fs_Type - .3) < epsilon) {
        col = texture(tex_Color4, fs_UV);
    } else {
        col = vec4(1, 1, 1, 1);
    }

    // if using textures, inverse gamma correct
    col.rgb = pow(col.rgb, vec3(2.2));
 
    // depth in camera screenspace
    vec4 projPos = (u_Proj * pos);
    float depth = projPos.z / projPos.w;

    // normal and depth value in w
    fragColor[0] = vec4(Nor.xyz, depth);
    
    // 1 since mesh overlaps
    fragColor[1] = vec4(1.0, 1.0, 1.0, 1.0);

    // albedo
    fragColor[2] = vec4(col.rgb, fs_Type);

}
