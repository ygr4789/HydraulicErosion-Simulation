uniform float u_timestep;
uniform float u_talusTangent;
uniform float u_cellWidth;
uniform float u_cellHeight;
uniform vec2 u_div;

uniform sampler2D tex_h2;

void main() {
  float dt = u_timestep;
  float lw = u_cellWidth;
  float lh = u_cellHeight;
  float tana = u_talusTangent;
  float lw_tana = lw * tana;
  float lh_tana = lh * tana;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 H = texture2D(tex_h2, uv);
  vec4 HL = texture2D(tex_h2, uv + vec2(-u_div.x, 0.f));
  vec4 HR = texture2D(tex_h2, uv + vec2(u_div.x, 0.f));
  vec4 HB = texture2D(tex_h2, uv + vec2(0.f, -u_div.y));
  vec4 HT = texture2D(tex_h2, uv + vec2(0.f, u_div.y));
  
  float eff = H.w + HL.w + HR.w + HB.w + HT.w;
  
  float d = H.x;
  float dL = HL.x;
  float dR = HR.x;
  float dB = HB.x;
  float dT = HT.x;
  float sL = max(0.f, (d - dL) - lw_tana);
  float sR = max(0.f, (d - dR) - lw_tana);
  float sB = max(0.f, (d - dB) - lh_tana);
  float sT = max(0.f, (d - dT) - lh_tana);

  vec4 S = vec4(sL, sR, sB, sT);
  if(eff == 0.f) S *= 0.f;
  gl_FragColor = S * dt;
}