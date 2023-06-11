attribute vec2 reference;

uniform sampler2D heightTexture;

varying vec3 vNormal; 
varying vec3 vColor;

void main() {
    vNormal = normalMatrix * normal;
    
    vec4 heightPixel = texture2D( heightTexture, reference );
    float b = heightPixel.x;
    float d = heightPixel.y;
    float s = heightPixel.z;
    vColor = vec3(0.5 + s, 0.5, 0.5 + d);
    vec4 vPosition = vec4(position.x, b + d, position.z, 1.0);
    
    gl_Position = projectionMatrix * modelViewMatrix * vPosition; 
}