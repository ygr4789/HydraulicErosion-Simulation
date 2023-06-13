attribute vec2 reference;

uniform sampler2D tex_alt;
uniform float u_cellWidth;
uniform float u_cellHeight;
uniform vec2 u_div;
uniform float u_vis_d;
uniform float u_vis_s;

varying vec3 vNormal;
varying vec3 vColor;

const vec3 ter1Color = vec3(0.6f, 0.64f, 0.47f);
const vec3 ter2Color = vec3(0.64f, 0.64f, 0.44f);
const vec3 waterColor = vec3(0, 0, 1);
const vec3 sediColor = vec3(1, 0, 0);

void main() {
    float lw = u_cellWidth;
    float lh = u_cellHeight;
    vec4 H = texture2D(tex_alt, reference);

    vec4 HL = texture2D(tex_alt, reference + vec2(-u_div.x, 0.f));
    vec4 HR = texture2D(tex_alt, reference + vec2(u_div.x, 0.f));
    vec4 HB = texture2D(tex_alt, reference + vec2(0.f, -u_div.y));
    vec4 HT = texture2D(tex_alt, reference + vec2(0.f, u_div.y));

    float hL = HL.x + HL.y;
    float hR = HR.x + HR.y;
    float hB = HB.x + HB.y;
    float hT = HT.x + HT.y;

    vec3 sw = vec3(2.f * lw, hR - hL, 0);
    vec3 sh = vec3(0, hT - hB, 2.f * lh);
    vec3 n = normalize(cross(sw, sh));

    float b = H.x;
    float d = H.y;
    float s = H.z;

    vNormal = normalMatrix * n;

    float waterf = d / u_vis_d;
    float sedif = s / u_vis_s;
    vec3 fluidColor = waterColor * waterf + sediColor * sedif;

    float terf = max(0.f, b - 1.f);
    terf = min(terf, 1.f);

    vec3 terColor = ter1Color * terf + ter2Color * (1.f - terf);
    vColor = terColor * (1.f - waterf) + fluidColor;

    vec4 vPosition = vec4(position.x, b + d, position.z, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
}