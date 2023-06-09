varying vec3 vNormal; 
varying vec3 vColor;

void main() {
    vColor = color;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
}