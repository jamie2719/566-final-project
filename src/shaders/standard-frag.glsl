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

in float offset;
in float landNoise;

vec3 terrainCol();
vec3 wallCol = vec3(178.0, 199.0, 232.0) / 255.0;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(in vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = vec4(a.x, a.x, a.y, a.y) + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + vec4(a.z, a.z, a.z, a.z);
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float fbm(const in vec3 uv)
{
    float a = 0.5;
    float f = 5.0;
    float n = 0.;
    int it = 8;
    for(int i = 0; i < 15; i++)
    {
        if(i<it)
        {
            n += noise(uv*f)*a;
            a *= .5;
            f *= 2.;
        }
    }
    return n;
}

void main() {

    // fragment info is in view space
    mat3 invTranspose = mat3(u_ModelInvTr);
    mat3 view = mat3(u_View);
    
    // do calculations in here to avoid vertices being cut off, per Jin
    vec4 Nor = vec4(view * invTranspose * fs_Nor.xyz, 0);
    vec4 pos = u_View * u_Model * fs_Pos;

    vec4 col;
    if(fs_Type == 0.0) { //terrain
        col = vec4(terrainCol(), 1.0);
    } else if(fs_Type == 1.0){ //alpaca
        col = texture(tex_Color0, fs_UV);
    } else if (fs_Type == 2.0) { //frame
        col = texture(tex_Color1, fs_UV);
    } else if (fs_Type == 3.0) { //wall
        col = vec4(wallCol, 1.0);
    } else if (fs_Type == 4.0) { // cloud
        float heightField = fbm(fs_Nor.brg);
        col = fs_Col;
    } else if (fs_Type == 5.0) { //tree
        col = texture(tex_Color3, fs_UV);
    } else if (fs_Type == 6.0) { //leaf
        col = texture(tex_Color4, fs_UV);
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

vec3 terrainCol() {
    vec3 diffuseColor;

     vec3 tanGrass = vec3(204.0f / 255.0f, 133.0 / 255.0f, 60.0 / 255.0f);
     vec3 grass = vec3(100.f / 255.f, 180.0f / 255.0f, 23.0f / 255.0);
     vec3 hill = vec3(180.0f / 255.0f, 179.0f / 255.0f, 200.0f / 255.0);
     vec3 mountain = vec3(80.0f / 255.0f, 190.0f / 255.0f, 200.0f / 255.0);


    if(offset > 7.f) { //background mountains and hills
        diffuseColor = mountain + vec3(0.0, landNoise*.3, landNoise*.8); // mountain
    }
    else if(offset > 4.f) { //background mountains and hills
        diffuseColor = hill + vec3(0.0, landNoise*.3, landNoise*.8); // mountain
    }
    else if(offset > 1.f) {
        diffuseColor = mix(tanGrass * 1.5f + vec3(landNoise*2.f, landNoise, 0.0f), .1 *grass, offset*.1); //grass 
        
    }
    else if(offset > -1.f){ 
        diffuseColor = grass + vec3(landNoise*2.f, landNoise*.7, 0.f);//mix(tanGrass + vec3(0.f, landNoise*.4, 0.f), grass + vec3(0.0, landNoise, 0.0f), -1.f*offset); //sand
    }
    
    //diffuseColor = hill + vec3(landNoise * .57, 0.0, 0.0); // mountain
    
    return diffuseColor;
}
