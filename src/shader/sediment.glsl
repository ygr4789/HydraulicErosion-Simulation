uniform float u_timestep;
uniform float u_cellWidth;
uniform float u_cellHeight;
uniform vec2 u_div;

uniform sampler2D tex_h2;
uniform sampler2D tex_vel;

void main() {
  float dt = u_timestep;
  float lw = u_cellWidth;
  float lh = u_cellHeight;
  
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 H = texture2D(tex_h2, uv);
  vec4 V = texture2D(tex_vel, uv);
  
  float dw = V.x * dt / lw;
  float dh = V.y * dt / lh;
  vec2 duv = vec2(dw, dh) * u_div;
  vec2 uv_ = uv - duv;
  
  vec4 H_ = texture2D(tex_h2, uv_);
  H.z = H_.z;
  gl_FragColor = H;
}