uniform float u_timestep;
uniform float u_cellWidth;
uniform float u_cellHeight;
uniform vec2 u_div;

uniform sampler2D tex_h1;
uniform sampler2D tex_flux;

void main() {
  float dt = u_timestep;
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

  float Fout = F.x + F.y + F.z + F.w;
  float Fin = fLR + fRL + fBT + fTB;
  float dV = dt * (Fin - Fout);

  vec4 H = texture2D(tex_h1, uv);
  H.y += dV / (lw * lh);

  gl_FragColor = H;
}