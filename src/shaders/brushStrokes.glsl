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
    /*
	mat3 horizontal = mat3(vec3(3.0, 10.0, 3.0), vec3(0.0, 0.0, 0.0), vec3(-3.0, -10.0, -3.0));
    mat3 vertical = mat3(vec3(3.0, 0.0, -3.0), vec3(10.0, 0.0, -10.0), vec3(3.0, 0.0, -3.0));
    float hGradientR = 0.0;
    float vGradientR = 0.0;
    float hGradientG = 0.0;
    float vGradientG = 0.0;
    float hGradientB = 0.0;
    float vGradientB = 0.0;

    vec3 col = vec3(0.0);
    for(int i = -1; i <= 1; i++) {      //column value
        for(int j = -1; j <= 1; j++) {  //row value
            float x = float((fs_UV.x * u_Dimensions.x) + float(i)) / u_Dimensions.x;
            float y = float((fs_UV.y * u_Dimensions.y) + float(j)) / u_Dimensions.y;
            if((x >= 0.0 && x <= 1.0) && (y >= 0.0 && y <= 1.0)) {
                col = (vec3(texture(u_frame, vec2(x, y))));
                int m1 = i + 1;
                int m2 = j + 1;
                hGradientR += col.x * horizontal[m1][m2];
                vGradientR += col.x * vertical[m1][m2];
                hGradientG += col.y * horizontal[m1][m2];
                vGradientG += col.y * vertical[m1][m2];
                hGradientB += col.z * horizontal[m1][m2];
                vGradientB += col.z * vertical[m1][m2];
            }
        }
    }
    vec3 oldColor = vec3(texture(u_frame, fs_UV));
    float r = sqrt(pow(vGradientR, 2.0) + pow(hGradientR, 2.0));
    float g = sqrt(pow(vGradientG, 2.0) + pow(hGradientG, 2.0));
    float b = sqrt(pow(vGradientB, 2.0) + pow(hGradientB, 2.0));
	col = vec3(r, g, b);
	float l = .1 - (0.21 * r + 0.72 * g + 0.07 * b);
    */

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
    /*

//http://supercomputingblog.com/graphics/oil-painting-algorithm/
    float intensityLevels = 10.0;
    int radius = 2;
    float maxCount = -1.0;
    int maxIndex = -1;
    float intensityCount[10];
    float avgR[10];
    float avgG[10];
    float avgB[10];

    for(int i = -radius / 2; i <= radius / 2; i++) {      //column value
        for(int j = -radius / 2; j <= radius / 2; j++) {  //row value
            float x = float((fs_UV.x * u_Dimensions.x) + float(i)) / u_Dimensions.x;
            float y = float((fs_UV.y * u_Dimensions.y) + float(j)) / u_Dimensions.y;
            if((x >= 0.0 && x <= 1.0) && (y >= 0.0 && y <= 1.0)) {
                vec3 col = (vec3(texture(u_frame, vec2(x, y))));
                int currIntensity = int(((col.x + col.y + col.z) / 3.0) * intensityLevels / 255.0);
                intensityCount[currIntensity]++;
                avgR[currIntensity] += col.r;
                avgG[currIntensity] += col.g;
                avgB[currIntensity] += col.b;

                if(intensityCount[currIntensity] > maxCount) {
                    maxCount = intensityCount[currIntensity];
                    maxIndex = int(currIntensity);
                }
            }
        }
    }

    float r = avgR[maxIndex] / maxCount;
    float g = avgG[maxIndex] / maxCount;
    float b = avgB[maxIndex] / maxCount;

    out_Col = vec4(r, g, b, 1.0);
*/
}
