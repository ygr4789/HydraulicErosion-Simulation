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
  float intentsity = 0.5 + 0.5 * dot(vNormal, directionalLights[0].direction);
  vec3 atmosphere = vColor * intentsity;
  gl_FragColor = vec4(atmosphere, 1.0);
}