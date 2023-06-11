uniform bool u_active;
uniform float u_timestep;
uniform float u_radius;
uniform float u_arriv;
uniform vec2 u_source;

uniform sampler2D tex_h2;

void main() {
  bool on = u_active;
  float dt = u_timestep;
  float rad = u_radius;
  float r_t = u_arriv;
  vec2 s = u_source;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 H = texture2D(tex_h2, uv);
  
  float db = 0.f;
  if(on && distance(uv, s) < rad) {
    db = r_t * dt;
  }
  H.y += db;

  gl_FragColor = H;
}
