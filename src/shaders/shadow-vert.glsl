#version 300 es
precision highp float;

uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;  

uniform mat4 u_View;   
uniform mat4 u_Proj; 
uniform mat4 u_viewProjOrthoMat;

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;
in vec2 vs_UV;

out vec4 fs_Pos;

void main()
{

    gl_Position = u_viewProjOrthoMat * u_Model * vs_Pos;
    fs_Pos = vs_Pos;

}
