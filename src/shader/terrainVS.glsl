attribute vec2 reference;

uniform sampler2D tex_alt;
uniform float u_cellWidth;
uniform float u_cellHeight;
uniform vec2 u_div;

varying vec3 vNormal;
varying vec3 vColor;

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
    vColor = vec3(0.5 + s, 0.5, 0.5 + d);
    
    vec4 vPosition = vec4(position.x, b + d, position.z, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
}