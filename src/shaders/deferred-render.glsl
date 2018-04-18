#version 300 es
precision highp float;

#define EPS 0.0001
#define PI 3.1415962

in vec2 fs_UV;
out vec4 out_Col;

const float TWO_PI = 6.28318530718;

uniform sampler2D u_gb0;
uniform sampler2D u_gb1;
uniform sampler2D u_gb2;
uniform sampler2D shadowMapTex;

uniform mat4 u_ShadowMat;
uniform mat4 u_LightProj;
uniform mat4 u_LightView;
uniform mat4 u_LightOrtho;

uniform vec2 u_Dimensions;

uniform mat4 u_invViewProjMat;
uniform mat4 u_viewProjOrthoMat;

uniform float u_Time;

uniform mat4 u_View;
uniform vec4 u_CamPos;   

uniform vec4 u_LightPos;

const vec3 sky[5] = vec3[](
        vec3(122, 155, 165) / 255.0,
vec3(220, 153, 162) / 255.0,
vec3(254, 196, 159) / 255.0,
vec3(217, 235, 215) / 255.0,
vec3(162, 230, 249) / 255.0);

vec4 skyShader();

float linearize(float depth) {
	float f=1000.0;
	float n = 0.1;
	float z = (2.0 * n) / (f + n - depth * (f - n));
	return z;
}

bool isVisible(float depth) {

	vec2 xy = fs_UV;
	xy = xy * 2.0 - vec2(1.0);
	
	vec4 camProjPos = vec4(xy.xy, depth, 1.0);
	vec4 camWorldPos = u_invViewProjMat * camProjPos;
	camWorldPos /= camWorldPos.w;

	vec4 lightProjPos = u_viewProjOrthoMat * camWorldPos;

	float currDepth = lightProjPos.z;

	vec2 screenSpaceLightPos = (lightProjPos.xy + vec2(1.0)) / 2.0;
	vec2 screenSpaceLightPosR = vec2(screenSpaceLightPos.x, 1.0 - screenSpaceLightPos.y);
	//out_Col = vec4(clamp(camWorldPos.xyz,0.0, 1.0), 1.0);
	//return;
	if(screenSpaceLightPos.x < 0.0 || screenSpaceLightPos.x > 1.0 || screenSpaceLightPos.y < 0.0 || screenSpaceLightPos.y > 1.0) {
		out_Col = vec4(0.0);
		//return;
	}
	
	float mapDepth = texture(shadowMapTex, screenSpaceLightPos).r;

	if(mapDepth < currDepth - .02) {
		return false;
	} 
	return true;
}

void main() { 
	// read from GBuffers
	vec4 fs_Nor = texture(u_gb0, fs_UV);
	
	vec4 meshOverlap = texture(u_gb1, fs_UV);
	vec4 diffuseColor = vec4((texture(u_gb2, fs_UV)).xyz, 1.0);

	// lambertian term for blinn 
	float diffuseTerm = dot(normalize(vec4(fs_Nor.xyz, 0.0)), normalize(u_LightPos));
	diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

	float ambientTerm = 0.4;

	float lightIntensity = diffuseTerm + ambientTerm; 

	//diffuseColor = diffuseColor * lightIntensity;
	if(meshOverlap != vec4(1.0)) {
		out_Col = skyShader();
		return;
	}
	if(!isVisible(fs_Nor.w)) {
		out_Col = diffuseColor * 0.5;
	} else {
		out_Col = vec4(diffuseColor.xyz, 1.0);
	}

	float ssample =texture(shadowMapTex, fs_UV).r;
	//out_Col.rgb = clamp(vec3(ssample),0.0, 1.0);
	return;
}

vec2 sphereToUV(vec3 p)
{
    float phi = atan(p.z, p.x); // Returns atan(z/x)
    if(phi < 0.0)
    {
        phi += TWO_PI; // [0, TWO_PI] range now
    }
    // ^^ Could also just add PI to phi, but this shifts where the UV loop from X = 1 to Z = -1.
    float theta = acos(p.y); // [0, PI]
    return vec2(1.0 - phi / TWO_PI, 1.0 - theta / PI);
}

vec2 smoothF(vec2 uv)
{
    return uv*uv*(3.-2.*uv);
}
// for use in fbm
float noise(in vec2 uv)
{
    const float k = 257.0;
    vec4 l  = vec4(floor(uv),fract(uv));
    float u = l.x + l.y * k;
    vec4 v  = vec4(u, u+1.,u+k, u+k+1.);
    v       = fract(fract(1.23456789*v)*v/.987654321);
    l.zw    = smoothF(l.zw);
    l.x     = mix(v.x, v.y, l.z);
    l.y     = mix(v.z, v.w, l.z);
    return    mix(l.x, l.y, l.w);
}

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
    for(int i = 0; i < 32; i++)
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

float fbm(const in vec2 uv)
{
    float a = 0.5;
    float f = 5.0;
    float n = 0.;
    int it = 8;
    for(int i = 0; i < 32; i++)
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

vec3 uvToSky(vec2 uv)
{
    // Below horizon
    if(uv.y < 0.5)
    {
        return sky[0];
    }
    else if(uv.y < 0.55) // 0.5 to 0.55
    {
        return mix(sky[0], sky[1], (uv.y - 0.5) / 0.05);
    }
    else if(uv.y < 0.6)// 0.55 to 0.6
    {
        return mix(sky[1], sky[2], (uv.y - 0.55) / 0.05);
    }
    else if(uv.y < 0.65) // 0.6 to 0.65
    {
        return mix(sky[2], sky[3], (uv.y - 0.6) / 0.05);
    }
    else if(uv.y < 0.75) // 0.65 to 0.75
    {
        return mix(sky[3], sky[4], (uv.y - 0.65) / 0.1);
    }
    return sky[4]; // 0.75 to 1
}

vec4 skyShader() {
	vec2 ndc = fs_UV * 2.0 - vec2(1.0);
	vec4 worldPos = vec4(ndc, 1.0, 1.0);
	worldPos *= 1000.0;
	worldPos = u_invViewProjMat * worldPos;

	vec3 rayDir = normalize(worldPos.xyz - u_CamPos.xyz);

	vec2 uv = sphereToUV(rayDir); // convert the ray to 2d coordinates for mapping color/texture to the quad

	    // return color based on uv y coordinate for shift in colors
    vec3 skyHue = uvToSky(uv);


    vec2 uvT1 = uv + vec2(u_Time * 0.001);
    vec2 uvT2 = uv + vec2(u_Time * 0.00005, -u_Time * 0.0002);

    // generate noise based on uv and time so the "clouds" move
    float heightField = fbm(rayDir);

    // calculate the 2d slope in order to create a smoother blend between shades
    vec2 slope = vec2(fbm(uvT2 + vec2(1.0/float(u_Dimensions.x), 0.0)) - fbm(uvT2 - vec2(1.0/float(u_Dimensions.x), 0.0)),
                      fbm(uvT2 + vec2(0.0, 1.0/float(u_Dimensions.y))) - fbm(uvT2 - vec2(0.0, 1.0/float(u_Dimensions.y))));

	vec3 distortedSkyHue;
    vec3 cloudColor;

	distortedSkyHue = uvToSky(uv + slope);
    cloudColor = sky[3];

	vec3 outColor = mix(distortedSkyHue, cloudColor, heightField * 0.75);
	
	return vec4(outColor, 1);
}