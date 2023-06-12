uniform vec2 u_div;

uniform sampler2D tex_h2;
uniform sampler2D tex_slip;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 S = texture2D(tex_slip, uv);
  vec4 SL = texture2D(tex_slip, uv + vec2(-u_div.x, 0.f));
  vec4 SR = texture2D(tex_slip, uv + vec2(u_div.x, 0.f));
  vec4 SB = texture2D(tex_slip, uv + vec2(0.f, -u_div.y));
  vec4 ST = texture2D(tex_slip, uv + vec2(0.f, u_div.y));

  float sLR = SL.y;
  float sRL = SR.x;
  float sBT = SB.w;
  float sTB = ST.z;

  vec4 H = texture2D(tex_h2, uv);
  vec4 HL = texture2D(tex_h2, uv + vec2(-u_div.x, 0.f));
  vec4 HR = texture2D(tex_h2, uv + vec2(u_div.x, 0.f));
  vec4 HB = texture2D(tex_h2, uv + vec2(0.f, -u_div.y));
  vec4 HT = texture2D(tex_h2, uv + vec2(0.f, u_div.y));

  float e = H.w;
  float eL = HL.w;
  float eR = HR.w;
  float eB = HB.w;
  float eT = HT.w;

  float sCL = eL * S.x;
  float sCR = eR * S.y;
  float sCB = eB * S.z;
  float sCT = eT * S.w;

  float Sout = sCL + sCR + sCB + sCT;
  float Sin = e * (sLR + sRL + sBT + sTB);
  float dd = Sin - Sout;

  H.x += dd;
  // effected
  if(abs(dd) > 0.f)
    H.w = 1.f;
  else
    H.w = 0.f;

  gl_FragColor = H;
}