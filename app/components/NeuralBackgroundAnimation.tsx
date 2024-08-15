import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  uniform vec2 mouse;
  varying vec2 vUv;

  // Simplex 2D noise function
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float neuralPattern(vec2 uv, float scale, float time) {
    float n = snoise(uv * scale + time * 0.1);
    float lines = abs(fract(n * 5.0) - 0.5) / scale;
    return smoothstep(0.0, 0.1, lines);
  }

  void main() {
    vec2 uv = vUv;
    float t = time * 0.2;
    
    // Create multiple layers of neural-like patterns
    float pattern1 = neuralPattern(uv, 3.0, t);
    float pattern2 = neuralPattern(uv, 5.0, -t * 1.5);
    float pattern3 = neuralPattern(uv, 7.0, t * 0.7);
    
    // Combine patterns
    float finalPattern = mix(pattern1, pattern2, 0.5);
    finalPattern = mix(finalPattern, pattern3, 0.3);
    
    // Create a subtle pulsing effect
    float pulse = (sin(t) + 1.0) * 0.5;
    finalPattern *= 0.8 + pulse * 0.2;
    
    // Color gradient
    vec3 baseColor = mix(color1, color2, uv.y);
    baseColor = mix(baseColor, color3, uv.x * (1.0 - uv.y));
    
    // Apply pattern to color
    vec3 finalColor = mix(baseColor, color3, finalPattern * 0.3);
    
    // Mouse interaction
    float mouseDistance = length(uv - mouse);
    float mouseEffect = smoothstep(0.0, 0.3, mouseDistance);
    finalColor = mix(finalColor * 1.2, finalColor, mouseEffect);
    
    // Subtle vignette
    float vignette = smoothstep(0.5, 0.2, length(uv - 0.5));
    finalColor *= vignette * 0.3 + 0.7;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const FlowingGradient: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouse = useRef([0, 0]);
  const { size } = useThree();

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color1: { value: new THREE.Color("#1a237e").multiplyScalar(0.7) }, // Darker blue
    color2: { value: new THREE.Color("#4a148c").multiplyScalar(0.7) }, // Darker purple
    color3: { value: new THREE.Color("#311b92").multiplyScalar(0.7) }, // Darker indigo
    mouse: { value: new THREE.Vector2() },
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.time.value = state.clock.getElapsedTime() * 0.5; // Slow down the animation
      uniforms.mouse.value.set(mouse.current[0], mouse.current[1]);
      (meshRef.current.material as THREE.ShaderMaterial).uniforms = uniforms;
    }
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    mouse.current = [
      event.clientX / size.width,
      1 - event.clientY / size.height,
    ];
  }, [size]);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  const shaderMaterialProps = useMemo(() => ({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
  }), [uniforms]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial attach="material" {...shaderMaterialProps} />
    </mesh>
  );
};

const NeuralBackgroundAnimation: React.FC = () => {
  return (
    <FlowingGradient />
  );
};

export default NeuralBackgroundAnimation;