uniform float u_erosion;
uniform float u_depsition;
uniform float u_capacity;
uniform float u_cellWidth;
uniform float u_cellHeight;
uniform vec2 u_div;

uniform sampler2D tex_h2;
uniform sampler2D tex_vel;

void main() {
  float Ks = u_erosion;
  float Kd = u_depsition;
  float lw = u_cellWidth;
  float lh = u_cellHeight;

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 V = texture2D(tex_vel, uv);
  float vel = length(V.xy);

  vec4 H = texture2D(tex_h2, uv);
  vec4 HL = texture2D(tex_h2, uv + vec2(-u_div.x, 0.f));
  vec4 HR = texture2D(tex_h2, uv + vec2(u_div.x, 0.f));
  vec4 HB = texture2D(tex_h2, uv + vec2(0.f, -u_div.y));
  vec4 HT = texture2D(tex_h2, uv + vec2(0.f, u_div.y));
  float dL = HL.x;
  float dR = HR.x;
  float dB = HB.x;
  float dT = HT.x;

  vec3 sw = vec3(2.f * lw, dR - dL, 0);
  vec3 sh = vec3(0, dT - dB, 2.f * lh);
  vec3 n = normalize(cross(sw, sh));
  
  float slope = length(n.xz);

  float d = H.y;
  float s = H.z;

  float C = u_capacity * max(0.1, slope) * vel;
  if(C > s) {
    H.x -= Ks * (C - s);
    H.z += Ks * (C - s);
  } else {
    H.x += Kd * (s - C);
    H.z -= Kd * (s - C);
  }
  // effected
  if(C != 0.f) H.w = 1.f;
  gl_FragColor = H;
}