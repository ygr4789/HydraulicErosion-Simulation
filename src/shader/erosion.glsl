uniform float u_erosion;
uniform float u_depsition;
uniform float u_capacity;

uniform sampler2D tex_h2;
uniform sampler2D tex_vel;

void main() {
  float Ks = u_erosion;
  float Kd = u_depsition;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 V = texture2D(tex_vel, uv);
  float vel = length(V.xy);

  vec4 H = texture2D(tex_h2, uv);
  float d = H.y;
  float s = H.z;

  float C = d * u_capacity * 0.1 * vel;
  if(C > s) {
    H.x -= Ks * (C - s);
    H.z += Ks * (C - s);
  } else {
    H.x += Kd * (s - C);
    H.z -= Kd * (s - C);
  }
  gl_FragColor = H;
}