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

  float Sout = S.x + S.y + S.z + S.w;
  float Sin = sLR + sRL + sBT + sTB;
  float dd = Sin - Sout;
  
  vec4 H = texture2D(tex_h2, uv);
  H.x += dd;
  // effected
  if(dd != 0.f) H.w = 1.f;
  else H.w = 0.f;
  
  gl_FragColor = H;
}