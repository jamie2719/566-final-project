#version 300 es
precision highp float;

uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;  

uniform mat4 u_View;   
uniform mat4 u_Proj; 
//uniform float u_mountainHeight; 

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;
in vec2 vs_UV;

out vec4 fs_Pos;
out vec4 fs_Nor;            
out vec4 fs_Col;           
out vec2 fs_UV;
out float offset;
out float landNoise;

const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.



// Return a random direction in a circle
vec3 random3(vec3 p) {
    return normalize(2.0f * fract(sin(vec3(dot(p,vec3(127.1,311.7, 217.4)),
    dot(p,vec3(269.5,183.3, 359.2)), 
    dot(p,vec3(171.1,513.3, 237.9))))*43758.5453) - 1.0f);
}

vec2 random2( vec2 p ) {
    return normalize(2.0f * fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453) - 1.0f);
}

// calculates the Perlin noise value for a point p given a nearby gridpoint
float perlin(vec3 p, vec3 gridPoint) {
    vec3 gradient = random3(gridPoint);
    vec3 toP = p - gridPoint;
    return dot(toP, gradient);
}

// takes in a position p, calculates the 8 grid points surrounding that position, calculates the 3D Perlin noise
// value at each of the 8 grid points, and uses trilinear interpolation to find the final Perlin noise value for p
float trilinearInterpolation(vec3 pos) {
    float tx = smoothstep(0.0, 1.0, fract(pos.x));
    float ty = smoothstep(0.0, 1.0, fract(pos.y));
    float tz = smoothstep(0.0, 1.0, fract(pos.z));

    vec3 bottomBackLeft = floor(vec3(pos));
    vec3 topBackLeft =      vec3(bottomBackLeft.x,        bottomBackLeft.y + 1.0f, bottomBackLeft.z);
    vec3 topBackRight =     vec3(bottomBackLeft.x + 1.0f, bottomBackLeft.y + 1.0f, bottomBackLeft.z);
    vec3 bottomBackRight =  vec3(bottomBackLeft.x + 1.0f, bottomBackLeft.y,        bottomBackLeft.z);
    vec3 bottomFrontLeft =  vec3(bottomBackLeft.x,        bottomBackLeft.y,        bottomBackLeft.z + 1.0f);
    vec3 topFrontLeft =     vec3(bottomBackLeft.x,        bottomBackLeft.y + 1.0f, bottomBackLeft.z + 1.0f);
    vec3 topFrontRight =    vec3(bottomBackLeft.x + 1.0f, bottomBackLeft.y + 1.0f, bottomBackLeft.z + 1.0f);
    vec3 bottomFrontRight = vec3(bottomBackLeft.x + 1.0f, bottomBackLeft.y,        bottomBackLeft.z + 1.0f);


    float bbl = perlin(vec3(pos), bottomBackLeft); 
    float tbl = perlin(vec3(pos), topBackLeft);
    float tbr = perlin(vec3(pos), topBackRight);
    float bbr = perlin(vec3(pos), bottomBackRight);
    float bfl = perlin(vec3(pos), bottomFrontLeft);
    float tfl = perlin(vec3(pos), topFrontLeft); 
    float tfr = perlin(vec3(pos), topFrontRight); 
    float bfr = perlin(vec3(pos), bottomFrontRight);

    //trilinear interpolation of 8 perlin noise values
    float tfbr = tfr * (tz) + tbr * (1.0f - tz);
    float tfbl = tbl * (1.0f - tz) + tfl * tz;
    float bfbl = bbl * (1.0f - tz) + bfl * tz;
    float bfbr = bfr * (tz) + bbr * (1.0f - tz);

    float top = tfbl * (1.0f - tx) + tfbr * tx;
    float bottom = bfbl * (1.0f - tx) + bfbr * tx;

    return top * (ty) + bottom * (1.0f - ty);
}

void main()
{
     // terrain noise calculation
    float summedNoise = 0.0;
    float amplitude = 5.f;//u_mountainHeight;
    float val;
    for(int i = 2; i <= 2048; i *= 2) {
        vec3 pos = vec3(vs_Pos) * .02000f  * float(i);
        val = trilinearInterpolation(pos);
        if(val > 0.f) {
           summedNoise += val * amplitude * 6.f;
        }
        summedNoise += val * amplitude;
        amplitude *= .3;
    }

    val =  summedNoise * .6;
    vec4 offsetPos = vec4(val * vs_Pos.rgb, 0.0);
    offset = val * vs_Pos.y;


    // water noise calculation
    vec3 waterPos = vec3(vs_Pos) * 16.f * (2.f)/4.0;
    landNoise = trilinearInterpolation(waterPos) *1.5f;

    fs_Col = offsetPos;//vs_Col;
    fs_UV = vs_UV;
    fs_UV.y = 1.0 - fs_UV.y;

    // fragment info is in view space
    mat3 invTranspose = mat3(u_ModelInvTr);
    mat3 view = mat3(u_View);
    fs_Nor = vec4(view * invTranspose * vec3(vs_Nor), 0);
    //fs_Pos = u_View * u_Model * vs_Pos;
    
    vec4 modelposition;
    modelposition = u_Model * (vs_Pos + vec4(0.0, val + vs_Pos.y, 0.0, 0.0));

    
       

    gl_Position = u_Proj * u_View * modelposition; 
}
