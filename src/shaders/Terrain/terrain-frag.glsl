#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec2 fs_UV;

in float offset;
in float landNoise;

out vec4 fragColor[3]; // The data in the ith index of this array of outputs
                       // is passed to the ith index of OpenGLRenderer's
                       // gbTargets array, which is an array of textures.
                       // This lets us output different types of data,
                       // such as albedo, normal, and position, as
                       // separate images from a single render pass.

uniform sampler2D tex_Color;

const vec4 lightPos = vec4(0, 7, 0, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.







void main() {
    // TODO: pass proper data into gbuffers
    // Presently, the provided shader passes "nothing" to the first
    // two gbuffers and basic color to the third.

    vec3 col = texture(tex_Color, fs_UV).rgb; 

    vec4 diffuseColor;
    
    // if(offset > .25) { 
    //     diffuseColor = vec4(1.0, 1.0, 1.0, 1.0); // mountaintop
    // } 
    if(offset > .2) { 
        diffuseColor = vec4(90.0f / 255.0f, 67.0f / 255.0f, 0.0f, 1.0f) + vec4(landNoise * .57, 0.0, 0.0, 0.0f); // mountain
    }
    else if(offset > .01) { 
        diffuseColor = mix(vec4(0.0f, 150.0f / 255.0f, 0.0f, 1.0) + vec4(0.0, landNoise, 0.0, 0.0f), vec4(90.0f / 255.0f, 67.0f / 255.0f, 0.0f, 1.0f) + vec4(landNoise * .57, 0.0, 0.0, 0.0f), 1.f-offset); //grass
    }
    else if(offset > -.3f) {
        diffuseColor = mix(vec4(248.0f / 255.0f, 205.0 / 255.0f, 80.0 / 255.0f, 1.0) + vec4(landNoise*.4, landNoise*.4, landNoise*.4, 0.0f), vec4(0.0f, 150.0f / 255.0f, 0.0f, 1.0) + vec4(0.0, landNoise, 0.0, 0.0f), 1.f -offset); //sand
        
    }
    else { 
        diffuseColor = mix(vec4(248.0f / 255.0f, 205.0 / 255.0f, 80.0 / 255.0f, 1.0) + vec4(landNoise*.4, landNoise*.4, landNoise*.4, 0.0f), vec4(0.0f, 150.0f / 255.0f, 0.0f, 1.0) + vec4(0.0, landNoise, 0.0, 0.0f), -1.f*offset); //sand
        //diffuseColor = texture(tex_C)
    }
    // else {
    //     diffuseColor = vec4(0.0f, 50.f/255.f, 1.0, 1.0);
    // }


   

    // Calculate the diffuse term for Lambert shading
    float diffuseTerm = dot(normalize(fs_Nor), normalize(lightPos - fs_Pos));
    // Avoid negative lighting values
     diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.3;

    float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.

    
    //lambert shading for terrain
    diffuseColor = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
 



    

    // // if using textures, inverse gamma correct
     col = pow(col, vec3(2.2));

    fragColor[0] = vec4(0.0);
    fragColor[1] = vec4(0.0);
    fragColor[2] = vec4(diffuseColor);
}
