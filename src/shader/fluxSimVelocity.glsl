uniform float u_cellWidth;
uniform float u_cellHeight;
uniform vec2 u_div;

uniform sampler2D tex_h1;
uniform sampler2D tex_h2;
uniform sampler2D tex_flux;

void main() {
  float lw = u_cellWidth;
  float lh = u_cellHeight;

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 F = texture2D(tex_flux, uv);
  vec4 FL = texture2D(tex_flux, uv + vec2(-u_div.x, 0.f));
  vec4 FR = texture2D(tex_flux, uv + vec2(u_div.x, 0.f));
  vec4 FB = texture2D(tex_flux, uv + vec2(0.f, -u_div.y));
  vec4 FT = texture2D(tex_flux, uv + vec2(0.f, u_div.y));

  float fLR = FL.y;
  float fRL = FR.x;
  float fBT = FB.w;
  float fTB = FT.z;

  float fCL = F.x;
  float fCR = F.y;
  float fCB = F.z;
  float fCT = F.w;

  float dWw = (fCR + fLR - fCL - fRL) / 2.f;
  float dWh = (fCT + fBT - fCB - fTB) / 2.f;

  vec4 H1 = texture2D(tex_h1, uv);
  vec4 H2 = texture2D(tex_h2, uv);
  float d1 = H1.y;
  float d2 = H2.y;
  float d = (d1 + d2) / 2.f;

  float vw = 0.f;
  float vh = 0.f;

  if(d > 0.f) {
    vw = dWw / (lw * d);
    vh = dWh / (lh * d);
  }

  gl_FragColor = vec4(vw, vh, 0.f, 0.f);
}