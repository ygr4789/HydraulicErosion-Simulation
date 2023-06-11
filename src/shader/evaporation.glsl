uniform float u_timestep;
uniform float u_evaporation;
uniform float u_epsilon;

uniform sampler2D tex_h2;

void main() {
  float dt = u_timestep;
  float r_e = u_evaporation;
  float eps = u_epsilon;
  float Ke = max(0.f, 1.f - r_e * dt);
  
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 H = texture2D(tex_h2, uv);
  
  float b = H.y;
  b *= Ke;
  if(b < eps) b = 0.f;
  H.y = b;
  
  gl_FragColor = H;
}