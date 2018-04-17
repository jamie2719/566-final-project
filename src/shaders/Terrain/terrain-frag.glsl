#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec2 fs_UV;

in float offset;

out vec4 fragColor[3]; // The data in the ith index of this array of outputs
                       // is passed to the ith index of OpenGLRenderer's
                       // gbTargets array, which is an array of textures.
                       // This lets us output different types of data,
                       // such as albedo, normal, and position, as
                       // separate images from a single render pass.

uniform sampler2D tex_Color;

const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.



// calculate color for poles of planet
vec4 colorPoles() {
    if(offset > .005) {
        return vec4(155.0f/255.0f, 161.0f/255.0f, 161.0f/255.0f, .8);
    }
    else if(offset > .02f) {
        return vec4(233.0f/255.0f, 1.0, 1.0, .8);
    }
    else if(offset > .06f) {
        return vec4(1.0, 1.0, 1.0, 1.0);
    }
}

//calculate color for ocean
//vec4 colorOcean() {
    //ocean is water
    //if(u_ocean == 1) { 
        //return vec4(0.0f, 0.0f, 200.0f/255.0f, .8f) + vec4(0.0f, 0.0f, waterNoise, 0.0f);
    //}
    // //ocean is lava
    // else { 
    //     return vec4(241.0f/255.0f, 20.0f/255.0f, 0.0f, .8f) + vec4(waterNoise, 0.0f, 0.0f, 0.0f);
    // }
//}


void main() {
    // TODO: pass proper data into gbuffers
    // Presently, the provided shader passes "nothing" to the first
    // two gbuffers and basic color to the third.

    vec3 col = texture(tex_Color, fs_UV).rgb; 

    vec4 diffuseColor;
    bool isOcean = false;

    if(offset > .25) { 
        diffuseColor = vec4(1.0, 1.0, 1.0, 1.0); // mountaintop
    } 
    else if(offset > .09) { 
        diffuseColor = vec4(90.0f / 255.0f, 67.0f / 255.0f, 0.0f, 1.0f); // mountain
    }
    else if(offset > .02) { 
        // raise water level
        // if(u_globalWarming == 2 && offset < .06) {
        //     diffuseColor = colorOcean();
        //     isOcean = true;
        // }
        // else {
            diffuseColor = vec4(0.0f, 150.0f / 255.0f, 0.0f, 1.0); //grass
        //}
    }
    else if(offset > .005) { 
        // raise water level
        // if(u_globalWarming == 1 || u_globalWarming == 2) {
        //     diffuseColor = colorOcean();
        //     isOcean = true;
        // }
        // else {
            diffuseColor = vec4(248.0f / 255.0f, 205.0 / 255.0f, 80.0 / 255.0f, 1.0); //sand
        //}  
    }
    else {
        // diffuseColor = colorOcean();
        // isOcean = true;
    }



// north and south pole icecaps
    //neutral
    //if(u_globalWarming == 0) { 
        if((fs_Pos.y < -.7f || fs_Pos.y > .8f)) {
            if(!isOcean) { 
                diffuseColor = colorPoles();
            }
            else {
                diffuseColor.a = .6f;
            }
        }
    //}     
    // //partially melted
    // else if(u_globalWarming == 1) { 
    //     if((fs_Pos.y < -.9f || fs_Pos.y > .95f)) { //ocean
    //         if(!isOcean) {

    //                 diffuseColor = colorPoles();

    //         }
    //         else {
    //             diffuseColor.a = .6f;
    //         }
    //     }
    // }
    // //partial ice age
    // else if(u_globalWarming == -1){ 
    //     if((fs_Pos.y < -.4f || fs_Pos.y > .5f)) { //ocean
    //         if(!isOcean) {
    //             diffuseColor = colorPoles();
    //         }
    //         else {
    //             diffuseColor.a = .6f;
    //         }
    //     }
    // }
    // //ice age
    // else if(u_globalWarming == -2) { 
    //     if(!isOcean) { 
    //         diffuseColor = colorPoles();
    //     }
    //     else {
           
    //         diffuseColor.a = .6f;

    //     }
    // }
    // else { //melted
        
    // }



    // vec4 view = fs_CamPos - fs_Pos;

    // vec4 h = (view + lightPos) / 2.0;
    // vec4 n = fs_Nor;
    // float specIntensity = max(pow(dot(normalize(h), normalize(n)), 100.0), 0.0f); // blinn-phong


    // // Calculate the diffuse term for Lambert shading
    // float diffuseTerm = dot(normalize(fs_Nor), normalize(lightPos));
    // // Avoid negative lighting values
    //  diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    // float ambientTerm = 0.3;

    // float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
    //                                                         //to simulate ambient lighting. This ensures that faces that are not
    //                                                         //lit by our point light are not completely black.

    // // Compute final shaded color
    // if(isOcean) {
    //     //blinn phong shading for ocean
    //     col = vec3(diffuseColor.rgb * lightIntensity + vec3(specIntensity));
    // }
    // else {
    //     //lambert shading for terrain
    //     col = vec3(diffuseColor.rgb * vec3(lightIntensity));
    // }

    

    // // if using textures, inverse gamma correct
     col = pow(col, vec3(2.2));

    fragColor[0] = vec4(0.0);
    fragColor[1] = vec4(0.0);
    fragColor[2] = vec4(col, diffuseColor.a);
}
