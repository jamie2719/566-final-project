#version 300 es
precision highp float;

in vec2 fs_UV;
out vec4 out_Col;

uniform sampler2D u_frame;
uniform vec2 u_Dimensions;
uniform float u_Time;

uniform sampler2D u_typeTex;


// Interpolation between color and greyscale over time on left half of screen
void main() {

float type = texture(u_typeTex, fs_UV).w;
if(type == 1.0) {
    out_Col = texture(u_frame, fs_UV);
    return;
}
// paint filter

    int radius = 8;
    vec2 uv = fs_UV;
    
    // kuwahara filter for painterly effect
    float n = float((radius + 1) * (radius + 1));

    vec3 m[4]; // mean
    vec3 s[4]; // standard deviation for each inner square
    for (int k = 0; k < 4; ++k) {
        m[k] = vec3(0.0);
        s[k] = vec3(0.0);
    }

    // calculate mean and sd for each quarter of the square
    for (int j = -radius; j <= 0; ++j)  {
        for (int i = -radius; i <= 0; ++i)  {
            vec3 c = texture(u_frame, uv + vec2(i,j) / u_Dimensions).rgb;
            m[0] += c;
            s[0] += c * c;
        }
    }

    for (int j = -radius; j <= 0; ++j)  {
        for (int i = 0; i <= radius; ++i)  {
            vec3 c = texture(u_frame, uv + vec2(i,j) / u_Dimensions).rgb;
            m[1] += c;
            s[1] += c * c;
        }
    }

    for (int j = 0; j <= radius; ++j)  {
        for (int i = 0; i <= radius; ++i)  {
            vec3 c = texture(u_frame, uv + vec2(i,j) / u_Dimensions).rgb;
            m[2] += c;
            s[2] += c * c;
        }
    }

    for (int j = 0; j <= radius; ++j)  {
        for (int i = -radius; i <= 0; ++i)  {
            vec3 c = texture(u_frame, uv + vec2(i,j) / u_Dimensions).rgb;
            m[3] += c;
            s[3] += c * c;
        }
    }


    float min_sigma2 = 1.0 * 2.71828 + 2.0;
    for (int k = 0; k < 4; ++k) {
        m[k] /= n; // average sum of colors for each quarter
        s[k] = abs(s[k] / n - m[k] * m[k]);

        float sigma2 = s[k].r + s[k].g + s[k].b;
        if (sigma2 < min_sigma2) {
            min_sigma2 = sigma2;
            out_Col = vec4(m[k], 1.0);
        }
    }
}
