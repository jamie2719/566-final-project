#version 300 es
precision highp float;

uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;  

uniform mat4 u_View;   
uniform mat4 u_Proj; 

uniform mat4 u_LightModel;
uniform mat4 u_LightView;   
uniform mat4 u_LightProj; 
uniform mat4 u_WorldToLightMat;

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;
in vec2 vs_UV;

out vec4 fs_Pos;
out vec4 fs_Nor;            
out vec4 fs_Col;           
out vec2 fs_UV;

out vec4 cam_Pos;
out vec4 lightViewPos;

void main()
{
    fs_Col = vs_Col;
    fs_UV = vs_UV;
   // cam_Pos = u_Proj * u_View * u_Model * vs_Pos;
    cam_Pos = u_View * u_Model * vs_Pos;
    fs_UV.y = 1.0 - fs_UV.y;

    lightViewPos = u_LightView * u_LightModel * vs_Pos; 
    
    fs_Nor = vs_Nor;
    fs_Pos = u_View * u_Model * vs_Pos; // position in worldspace
    
    
    gl_Position = u_Proj * u_View * u_Model * vs_Pos;

}
