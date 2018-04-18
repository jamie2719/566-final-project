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

uniform sampler2D tex_Color;

in float offset;
in float landNoise;

vec3 terrainCol();


void main() {

    // fragment info is in view space
    mat3 invTranspose = mat3(u_ModelInvTr);
    mat3 view = mat3(u_View);
    
    // do calculations in here to avoid vertices being cut off, per Jin
    vec4 Nor = vec4(view * invTranspose * fs_Nor.xyz, 0);
    vec4 pos = u_View * u_Model * fs_Pos;

    vec3 col;
    if(fs_Type == 0.0) {
        col = terrainCol();
    } else {
        col = texture(tex_Color, fs_UV).rgb;
    }

    // if using textures, inverse gamma correct
    col = pow(col, vec3(2.2));

    // depth in camera screenspace
    vec4 projPos = (u_Proj * pos);
    float depth = projPos.z / projPos.w;

    // normal and depth value in w
    fragColor[0] = vec4(Nor.xyz, depth);
    
    // 1 since mesh overlaps
    fragColor[1] = vec4(1.0);

    // albedo
    fragColor[2] = vec4(col, 1.0);

}

vec3 terrainCol() {
    vec3 diffuseColor;
    
    vec3 tanGrass = vec3(248.0f / 255.0f, 205.0 / 255.0f, 80.0 / 255.0f);
    vec3 grass = vec3(30.f / 255.f, 120.0f / 255.0f, 0.0f);
    vec3 hill = vec3(90.0f / 255.0f, 67.0f / 255.0f, 0.0f);


    if(offset > .2) { 
        diffuseColor = hill + vec3(landNoise * .57, 0.0, 0.0); // mountain
    }
    else if(offset > -.3f) {
        diffuseColor = mix(tanGrass + vec3(landNoise*.4, landNoise*.4, landNoise*.4), grass + vec3(0.0, landNoise, 0.0), 1.f -offset); //sand
        
    }
    else { 
        diffuseColor = mix(tanGrass + vec3(landNoise*.4, landNoise*.4, landNoise*.4), grass + vec3(0.0, landNoise, 0.0), -1.f*offset); //sand
    }
    return diffuseColor;
}
