uniform float u_timestep;
uniform float u_gravity;
uniform float u_damping;
uniform float u_pipeLength;
uniform float u_pipeArea;
uniform float u_cellWidth;
uniform float u_cellHeight;
uniform vec2 u_div;

uniform sampler2D tex_h1;
uniform sampler2D tex_flux;

void main() {
  float dt = u_timestep;
  float g = u_gravity;
  float D = u_damping;
  float L = u_pipeLength;
  float A = u_pipeArea;
  float lw = u_cellWidth;
  float lh = u_cellHeight;

  float Kf = (dt * A * g) / L;
  float Kd = dt * D * L;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 H = texture2D(tex_h1, uv);

  vec4 HL = texture2D(tex_h1, uv + vec2(-u_div.x, 0.f));
  vec4 HR = texture2D(tex_h1, uv + vec2(u_div.x, 0.f));
  vec4 HB = texture2D(tex_h1, uv + vec2(0.f, -u_div.y));
  vec4 HT = texture2D(tex_h1, uv + vec2(0.f, u_div.y));

  float h = H.x + H.y;
  float hL = HL.x + HL.y;
  float hR = HR.x + HR.y;
  float hB = HB.x + HB.y;
  float hT = HT.x + HT.y;

  float dhL = h - hL;
  float dhR = h - hR;
  float dhB = h - hB;
  float dhT = h - hT;

  vec4 F = texture2D(tex_flux, uv);
  float fL = max(F.x * (1.f - Kd) + dhL * Kf, 0.f);
  float fR = max(F.y * (1.f - Kd) + dhR * Kf, 0.f);
  float fB = max(F.z * (1.f - Kd) + dhB * Kf, 0.f);
  float fT = max(F.w * (1.f - Kd) + dhT * Kf, 0.f);

  float d = H.y;
  float fTot = fL + fR + fB + fT;
  float V = d * lw * lh;
  float K = min(1.f, V / ((fTot + 0.001) * dt));
  if(d == 0.f)
    K = 0.f;

  gl_FragColor = vec4(fL, fR, fB, fT) * K;
}