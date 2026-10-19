// A self-contained, ambient 3D scene behind the Hero section: a slowly
// rotating wireframe icosahedron with a loose particle field around it,
// in the site's own teal/gold palette. Plain Three.js (not
// react-three-fiber) so the whole lifecycle - mount, resize, cleanup -
// is explicit and easy to audit in one place.
import { useEffect, useRef } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  IcosahedronGeometry,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  Color,
} from "three";

const MOBILE_BREAKPOINT = 900; // matches .visual's hide breakpoint in Hero.module.css

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.innerWidth < MOBILE_BREAKPOINT) return; // skip entirely on mobile, not just hide

    let renderer;
    let animationId;
    let disposed = false;

    try {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      const scene = new Scene();
      const camera = new PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.z = 9;

      renderer = new WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      // Wireframe icosahedron - the "crystal" centerpiece
      const icoGeometry = new IcosahedronGeometry(3, 1);
      const wireframe = new WireframeGeometry(icoGeometry);
      const ico = new LineSegments(
        wireframe,
        new LineBasicMaterial({
          color: new Color("#9a772b"), // gold
          transparent: true,
          opacity: 0.55,
        }),
      );
      scene.add(ico);

      // Particle field around it
      const PARTICLE_COUNT = 180;
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const radius = 4 + Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
      }
      const particleGeometry = new BufferGeometry();
      particleGeometry.setAttribute(
        "position",
        new Float32BufferAttribute(positions, 3),
      );
      const particles = new Points(
        particleGeometry,
        new PointsMaterial({
          color: new Color("#427e94"), // teal
          size: 0.06,
          transparent: true,
          opacity: 0.6,
        }),
      );
      scene.add(particles);

      const reducedMotion = prefersReducedMotion();

      function render() {
        if (disposed) return;
        if (!reducedMotion) {
          ico.rotation.y += 0.0018;
          ico.rotation.x += 0.0009;
          particles.rotation.y -= 0.0006;
        }
        renderer.render(scene, camera);
        if (!reducedMotion) animationId = requestAnimationFrame(render);
      }
      render();

      const handleResize = () => {
        if (!mount) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        disposed = true;
        window.removeEventListener("resize", handleResize);
        if (animationId) cancelAnimationFrame(animationId);
        icoGeometry.dispose();
        wireframe.dispose();
        ico.material.dispose();
        particleGeometry.dispose();
        particles.material.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      // No WebGL or something else went wrong - the hero's CSS blobs
      // already carry the section visually, so just skip quietly.
      console.error("HeroScene failed to initialize:", err);
      return undefined;
    }
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}
