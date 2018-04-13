#version 300 es
precision highp float;

#define EPS 0.0001
#define PI 3.1415962

in vec2 fs_UV;
out vec4 out_Col;

uniform sampler2D u_gb0;
uniform sampler2D u_gb1;
uniform sampler2D u_gb2;

uniform float u_Time;

uniform mat4 u_View;
uniform vec4 u_CamPos;   

uniform vec4 u_LightPos;

void main() { 
	// read from GBuffers

	vec3 fs_Nor = vec3(texture(u_gb0, fs_UV));
	//vec4 meshOverlap = texture(u_gb1, fs_UV);
	 vec4 diffuseColor = vec4((texture(u_gb2, fs_UV)).xyz, 1.0);

	// lambertian term for blinn 
	float diffuseTerm = dot(normalize(vec4(fs_Nor, 0.0)), normalize(u_LightPos));
	diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

	float ambientTerm = 0.2;

	float lightIntensity = diffuseTerm + ambientTerm; 
	 
	 //if(meshOverlap == vec4(1.0)) {
		out_Col = diffuseColor;// * lightIntensity;
	// } else {
	//	 out_Col = skyShader();
	 //}
	 
	
}