import { useEffect, useRef } from 'react';

/** Извиква onFrame на всеки кадър, докато active е true. dt е в секунди. */
export function useAnimationFrame(
  active: boolean,
  onFrame: (dt: number) => void
) {
  const callback = useRef(onFrame);

  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      // Ограничаваме dt, за да няма скок след скрит таб
      callback.current(Math.min((now - last) / 1000, 0.1));
      last = now;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}
