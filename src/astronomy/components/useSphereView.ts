import { useRef, useState, type PointerEvent } from 'react';
import {
  DEG,
  ZENITH,
  cross,
  dot,
  normalize,
  scale,
  type Vec3,
} from './skyMath';

const SAMPLES = 144;

export type SphereView = { azimuth: number; elevation: number };

/** Точки от окръжност; f получава ъгъл в радиани от from до to градуса. */
export function circlePoints(f: (t: number) => Vec3, from = 0, to = 360) {
  const points: Vec3[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    points.push(f((from + ((to - from) * i) / SAMPLES) * DEG));
  }
  return points;
}

/** Ортогонална проекция на небесната сфера, която се върти с мишката. */
export function useSphereView(
  defaultView: SphereView,
  center: { x: number; y: number },
  radius: number
) {
  const [view, setView] = useState(defaultView);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const az = view.azimuth * DEG;
  const el = view.elevation * DEG;
  const camera: Vec3 = [
    Math.cos(el) * Math.cos(az),
    Math.cos(el) * Math.sin(az),
    Math.sin(el),
  ];
  const right = normalize(cross(scale(camera, -1), ZENITH));
  const up = cross(right, scale(camera, -1));
  const project = (v: Vec3) => ({
    x: center.x + radius * dot(v, right),
    y: center.y - radius * dot(v, up),
    front: dot(v, camera) >= 0,
  });

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (!drag.current.moved) {
      // Прихващаме показалеца едва при движение, за да работят кликовете
      if (Math.hypot(dx, dy) < 4) return;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    drag.current = { x: e.clientX, y: e.clientY, moved: true };
    setView(v => ({
      azimuth: v.azimuth - dx * 0.4,
      elevation: Math.max(-10, Math.min(70, v.elevation + dy * 0.3)),
    }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return {
    project,
    resetView: () => setView(defaultView),
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
