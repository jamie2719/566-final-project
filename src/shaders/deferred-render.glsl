#version 300 es
precision highp float;

#define EPS 0.0001
#define PI 3.1415962

in vec2 fs_UV;
out vec4 out_Col;

uniform sampler2D u_gb0;
uniform sampler2D u_gb1;
uniform sampler2D u_gb2;
uniform sampler2D shadowMapTex;

uniform mat4 u_ShadowMat;
uniform mat4 u_LightProj;
uniform mat4 u_LightView;
uniform mat4 u_LightOrtho;

uniform vec2 u_Dimesnion;

uniform mat4 u_invViewProjMat;
uniform mat4 u_viewProjOrthoMat;

uniform float u_Time;

uniform mat4 u_View;
uniform vec4 u_CamPos;   

uniform vec4 u_LightPos;

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

	if(!isVisible(fs_Nor.w)) {
		out_Col = diffuseColor * 0.5;
	} else {
		out_Col = vec4(diffuseColor.xyz, 1.0);
	}

	float ssample =texture(shadowMapTex, fs_UV).r;
	//out_Col.rgb = clamp(vec3(ssample),0.0, 1.0);
	return;
}

vec4 skyShader() {
	return vec4(1.0);
}