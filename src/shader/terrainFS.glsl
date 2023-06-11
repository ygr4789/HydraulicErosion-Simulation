#if NUM_DIR_LIGHTS > 0
struct DirectionalLight {
  vec3 direction;
  vec3 color;
};
uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
#endif

varying vec3 vNormal;
varying vec3 vColor;

void main() {
  vec3 light = directionalLights[0].direction;
  float diffusion = max(0.f, -dot(vNormal, light));
  float intentsity = 0.3 + diffusion;
  vec3 atmosphere = vColor * intentsity;
  gl_FragColor = vec4(atmosphere, 1.0);
}