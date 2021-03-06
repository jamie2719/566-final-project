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
uniform sampler2D cloudTex;
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

// note: if want to use later, it's not being set right now
// uniform vec4 u_LightPos;

// const vec3 sky[5] = vec3[](
// vec3(182, 112, 50) / 255.0,
// vec3(214, 158, 81) / 255.0,
// vec3(254, 196, 159) / 255.0,
// vec3(238, 202, 102) / 255.0,
// vec3(255, 242, 198) / 255.0);

// vec3 wallCol = vec3(178.0, 199.0, 232.0) / 255.0;

// vec4 skyShader();

// bool isVisible(float depth) {

// 	vec2 xy = fs_UV;
// 	xy = xy * 2.0 - vec2(1.0);
	
// 	vec4 camProjPos = vec4(xy.xy, depth, 1.0);
// 	vec4 camWorldPos = u_invViewProjMat * camProjPos; 
// 	camWorldPos /= camWorldPos.w;

// 	vec4 lightProjPos = u_viewProjOrthoMat * camWorldPos; // light screen space

// 	float currDepth = lightProjPos.z;

// 	vec2 screenSpaceLightPos = (lightProjPos.xy + vec2(1.0)) / 2.0;
// 	vec2 screenSpaceLightPosR = vec2(screenSpaceLightPos.x, 1.0 - screenSpaceLightPos.y);
// 	//out_Col = vec4(clamp(camWorldPos.xyz,0.0, 1.0), 1.0);
// 	//return;
// 	if(screenSpaceLightPos.x < 0.0 || screenSpaceLightPos.x > 1.0 || screenSpaceLightPos.y < 0.0 || screenSpaceLightPos.y > 1.0) {
// 		out_Col = vec4(0.0);
// 		//return;
// 	}
	
// 	float mapDepth = texture(shadowMapTex, screenSpaceLightPos).r;

// 	if(mapDepth < currDepth - .02) {
// 		return false;
// 	} 
// 	return true;
// }

vec4 backgroundCol = vec4(.001, .001, .01, 1);

void main() { 
	// read from GBuffers
	vec4 fs_Nor = texture(u_gb0, fs_UV);

    float type = texture(u_gb2, fs_UV).w;
	
	vec4 meshOverlap = texture(u_gb1, fs_UV);

	vec4 diffuseColor = vec4((texture(u_gb2, fs_UV)).xyz, 1.0);

	// lambertian term for blinn 
	vec4 lightPos = vec4(1.0, 0.5, 1.6, 1.0);
	float diffuseTerm = dot(normalize(vec4(fs_Nor.xyz, 0.0)), normalize(lightPos));
	diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

	float ambientTerm = 0.4;

	float lightIntensity = diffuseTerm + ambientTerm; 

	if(meshOverlap.xyz != vec3(1.0)) {
		out_Col = backgroundCol;
		return;
	}
    // 1 corresponds to frame/wall? 
    bool isWall = false;
    if(abs(type - .3) < .01) {
        isWall = true;
    }

	// if(!(isVisible(fs_Nor.w)) && !isWall) {
	// 	out_Col = diffuseColor * 0.5;  
	// } else {
		out_Col = vec4(diffuseColor.xyz * lightIntensity, 1.0);
	//}

    // distance fog
    // vec4 fogColor = vec4(sky[3].xyz, 1.0);

    float depth = fs_Nor.w;
	vec2 xy = fs_UV;
	xy = xy * 2.0 - vec2(1.0);
	
	vec4 camProjPos = vec4(xy.xy, depth, 1.0);
	vec4 worldPos = u_invViewProjMat * camProjPos; 
	worldPos /= worldPos.w;

    // float minFogDist = 300.0;
    // float maxFogDist = 800.0;
    // //float camDist = distance(u_CamPos, worldPos);
    // float camDist = length(u_CamPos.xyz - worldPos.xyz);
    // if(camDist > minFogDist) {
    //     out_Col = mix(out_Col, fogColor, (camDist - minFogDist) / (maxFogDist - minFogDist));
    // }
    // if (camDist > maxFogDist) {
    //     out_Col = fogColor;
    // }
    
}

// vec2 sphereToUV(vec3 p)
// {
//     float phi = atan(p.z, p.x); // Returns atan(z/x)
//     if(phi < 0.0)
//     {
//         phi += TWO_PI; // [0, TWO_PI] range now
//     }
//     // ^^ Could also just add PI to phi, but this shifts where the UV loop from X = 1 to Z = -1.
//     float theta = acos(p.y); // [0, PI]
//     return vec2(1.0 - phi / TWO_PI, 1.0 - theta / PI);
// }

// vec2 smoothF(vec2 uv)
// {
//     return uv*uv*(3.-2.*uv);
// }
// // for use in fbm
// float noise(in vec2 uv)
// {
//     const float k = 257.0;
//     vec4 l  = vec4(floor(uv),fract(uv));
//     float u = l.x + l.y * k;
//     vec4 v  = vec4(u, u+1.,u+k, u+k+1.);
//     v       = fract(fract(1.23456789*v)*v/.987654321);
//     l.zw    = smoothF(l.zw);
//     l.x     = mix(v.x, v.y, l.z);
//     l.y     = mix(v.z, v.w, l.z);
//     return    mix(l.x, l.y, l.w);
// }

// float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
// vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
// vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

// float noise(in vec3 p){
//     vec3 a = floor(p);
//     vec3 d = p - a;
//     d = d * d * (3.0 - 2.0 * d);

//     vec4 b = vec4(a.x, a.x, a.y, a.y) + vec4(0.0, 1.0, 0.0, 1.0);
//     vec4 k1 = perm(b.xyxy);
//     vec4 k2 = perm(k1.xyxy + b.zzww);

//     vec4 c = k2 + vec4(a.z, a.z, a.z, a.z);
//     vec4 k3 = perm(c);
//     vec4 k4 = perm(c + 1.0);

//     vec4 o1 = fract(k3 * (1.0 / 41.0));
//     vec4 o2 = fract(k4 * (1.0 / 41.0));

//     vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
//     vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

//     return o4.y * d.y + o4.x * (1.0 - d.y);
// }

// float fbm(const in vec3 uv)
// {
//     float a = 0.5;
//     float f = 5.0;
//     float n = 0.;
//     int it = 8;
//     for(int i = 0; i < 32; i++)
//     {
//         if(i<it)
//         {
//             n += noise(uv*f)*a;
//             a *= .5;
//             f *= 2.;
//         }
//     }
//     return n;
// }

// float fbm(const in vec2 uv)
// {
//     float a = 0.5;
//     float f = 5.0;
//     float n = 0.;
//     int it = 8;
//     for(int i = 0; i < 32; i++)
//     {
//         if(i<it)
//         {
//             n += noise(uv*f)*a;
//             a *= .5;
//             f *= 2.;
//         }
//     }
//     return n;
// }

// vec3 uvToSky(vec2 uv)
// {
//     float lB = .4; // lower bound of horizon
//     // Below horizon
//     if(uv.y < lB)
//     {
//         return sky[0];
//     }
//     else if(uv.y < (lB + 0.05)) // 0.5 to 0.55
//     {
//         return mix(sky[0], sky[1], (uv.y - (lB)) / 0.05);
//     }
//     else if(uv.y < (lB + 0.1))// 0.55 to 0.6
//     {
//         return mix(sky[1], sky[2], (uv.y - (lB + 0.05)) / 0.05);
//     }
//     else if(uv.y < (lB + 0.15)) // 0.6 to 0.65
//     {
//         return mix(sky[2], sky[3], (uv.y - (lB + 0.1)) / 0.05);
//     }
//     else if(uv.y < (lB + 0.25)) // 0.65 to 0.75
//     {
//         return mix(sky[3], sky[4], (uv.y - (lB + 0.15)) / 0.1);
//     }
//     return sky[4]; // 0.75 to 1
// }

// vec4 skyShader() {
// 	vec2 ndc = fs_UV * 2.0 - vec2(1.0);
// 	vec4 worldPos = vec4(ndc, 1.0, 1.0);
// 	worldPos *= 1000.0;
// 	worldPos = u_invViewProjMat * worldPos;

// 	vec3 rayDir = normalize(worldPos.xyz - u_CamPos.xyz);

// 	vec2 uv = sphereToUV(rayDir); // convert the ray to 2d coordinates for mapping color/texture to the quad

// 	    // return color based on uv y coordinate for shift in colors
//     vec3 skyHue = uvToSky(uv);


//     vec2 uvT1 = uv + vec2(u_Time * 0.001);
//     vec2 uvT2 = uv + vec2(u_Time * 0.00005, -u_Time * 0.0002);

//     // generate noise based on uv and time so the "clouds" move
//     float heightField = fbm(rayDir);

//     // calculate the 2d slope in order to create a smoother blend between shades
//     vec2 slope = vec2(fbm(uvT2 + vec2(1.0/float(u_Dimensions.x), 0.0)) - fbm(uvT2 - vec2(1.0/float(u_Dimensions.x), 0.0)),
//                       fbm(uvT2 + vec2(0.0, 1.0/float(u_Dimensions.y))) - fbm(uvT2 - vec2(0.0, 1.0/float(u_Dimensions.y))));

// 	vec3 distortedSkyHue;
//     vec3 cloudColor;

// 	distortedSkyHue = uvToSky(uv + slope);
//     cloudColor = sky[3];

// 	float sunSize = 20.0;
// 	vec3 sunCol = vec3(1.0);
// 	vec3 sunDir = normalize(u_LightPos.xyz);
// 	float angle = acos(dot(rayDir, sunDir)) * 360.0 / PI;
// 	if(angle < sunSize) {
// 		return vec4(mix(sunCol, cloudColor, heightField * 0.75 * angle / 30.0), 1.0);
// 	}

// 	vec3 outColor = mix(distortedSkyHue, cloudColor, heightField * 0.75);
// 	if(rayDir.z > 0.099) {
//         outColor = wallCol;
//     }
// 	return vec4(outColor, 1);
// }