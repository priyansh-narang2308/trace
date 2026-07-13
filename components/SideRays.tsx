import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';

type Origin = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface SideRaysProps {
  speed?: number;
  rayColor1?: string;
  rayColor2?: string;
  intensity?: number;
  spread?: number;
  origin?: Origin;
  tilt?: number;
  saturation?: number;
  blend?: number;
  falloff?: number;
  opacity?: number;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const originToFlip = (origin: Origin): [number, number] => {
  switch (origin) {
    case 'top-left': return [1, 0];
    case 'bottom-right': return [0, 1];
    case 'bottom-left': return [1, 1];
    default: return [0, 0];
  }
};

const SideRays = ({
  speed = 2.5,
  rayColor1 = '#FF2A2A',
  rayColor2 = '#FF6363',
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 2.0,
  opacity = 1.0,
  className = ''
}: SideRaysProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Record<string, { value: number | number[] }> | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
      cleanupFunctionRef.current = null;
    }

    const initializeWebGL = async () => {
      if (!containerRef.current) return;

      await new Promise<void>(resolve => setTimeout(resolve, 10));

      if (!containerRef.current) return;

      const renderer = new Renderer({
        dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.25),
        alpha: true
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      gl.canvas.style.pointerEvents = 'none';
      gl.canvas.style.willChange = 'transform';
      gl.canvas.style.transform = 'translateZ(0)';

      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      const vert = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform vec2 iFlip;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  if (iFlip.x > 0.0) uv.x = 1.0 - uv.x;
  if (iFlip.y > 0.0) uv.y = 1.0 - uv.y;

  vec2 pos = uv - vec2(1.0, 1.0);
  float angle = atan(pos.y, pos.x) + (iTilt * 3.14159 / 180.0);
  float dist = length(pos);

  float ray1 = sin(angle * (15.0 * iSpread) + iTime * iSpeed) * 0.5 + 0.5;
  float ray2 = sin(angle * (25.0 * iSpread) - iTime * (iSpeed * 0.8) + 2.0) * 0.5 + 0.5;
  float ray3 = sin(angle * (35.0 * iSpread) + iTime * (iSpeed * 0.5) + 4.0) * 0.5 + 0.5;

  float rays = (ray1 * 0.5 + ray2 * 0.3 + ray3 * 0.2);
  rays = pow(rays, 2.0) * iIntensity;

  float fade = pow(1.0 - clamp(dist, 0.0, 1.0), iFalloff);
  float edgeFade = smoothstep(0.0, 0.1, uv.x) * smoothstep(0.0, 0.1, uv.y);
  float alpha = rays * fade * edgeFade * iOpacity;

  vec3 color = mix(iRayColor1, iRayColor2, sin(angle * 2.0 + iTime * 0.5) * 0.5 + 0.5);
  vec3 hsv = rgb2hsv(color);
  hsv.y *= iSaturation;
  hsv.z *= (0.8 + 0.4 * rays);
  color = hsv2rgb(hsv);

  gl_FragColor = vec4(color * alpha, alpha);
}`;

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [gl.canvas.width, gl.canvas.height] },
        iSpeed: { value: speed },
        iRayColor1: { value: hexToRgb(rayColor1) },
        iRayColor2: { value: hexToRgb(rayColor2) },
        iIntensity: { value: intensity },
        iSpread: { value: spread },
        iFlip: { value: originToFlip(origin) },
        iTilt: { value: tilt },
        iSaturation: { value: saturation },
        iBlend: { value: blend },
        iFalloff: { value: falloff },
        iOpacity: { value: opacity }
      };

      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const handleResize = () => {
        if (!rendererRef.current || !containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        rendererRef.current.setSize(width, height);
        if (uniformsRef.current) {
          uniformsRef.current.iResolution.value = [gl.canvas.width, gl.canvas.height];
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      let lastTime = performance.now();
      const animate = (currentTime: number) => {
        const delta = (currentTime - lastTime) * 0.001;
        lastTime = currentTime;

        if (uniformsRef.current && rendererRef.current && meshRef.current) {
          uniformsRef.current.iTime.value = (uniformsRef.current.iTime.value as number) + delta;
          rendererRef.current.render({ scene: meshRef.current });
        }

        animationIdRef.current = requestAnimationFrame(animate);
      };

      animationIdRef.current = requestAnimationFrame(animate);

      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }

        window.removeEventListener('resize', handleResize);

        if (rendererRef.current && rendererRef.current.gl.canvas.parentNode) {
          rendererRef.current.gl.canvas.parentNode.removeChild(rendererRef.current.gl.canvas);
        }

        const callIfFn = (obj: unknown, key: string) => {
          const fn = obj && (obj as Record<string, unknown>)[key];
          if (typeof fn === 'function') {
            (fn as () => void).call(obj);
          }
        };

        callIfFn(meshRef.current, 'remove');
        callIfFn(program, 'remove');
        callIfFn(geometry, 'remove');

        if (rendererRef.current) {
          const glContext = rendererRef.current.gl;
          const loseContext = glContext.getExtension('WEBGL_lose_context');
          if (loseContext) loseContext.loseContext();
        }

        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
      };
    };

    initializeWebGL();

    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, [isVisible, origin]);

  useEffect(() => {
    if (!uniformsRef.current) return;
    const u = uniformsRef.current;
    u.iSpeed.value = speed;
    u.iRayColor1.value = hexToRgb(rayColor1);
    u.iRayColor2.value = hexToRgb(rayColor2);
    u.iIntensity.value = intensity;
    u.iSpread.value = spread;
    u.iFlip.value = originToFlip(origin);
    u.iTilt.value = tilt;
    u.iSaturation.value = saturation;
    u.iBlend.value = blend;
    u.iFalloff.value = falloff;
    u.iOpacity.value = opacity;
  }, [speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden pointer-events-none z-[3] ${className}`.trim()}
    />
  );
};

export default SideRays;
