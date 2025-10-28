import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface InteractiveTriangleProps {
  type: 'angles' | 'exterior' | 'inequality';
}

export function InteractiveTriangle({ type }: InteractiveTriangleProps) {
  const [dimensions, setDimensions] = useState({ width: 550, height: 360 });
  const [vertices, setVertices] = useState<Point[]>([
    { x: 200, y: 50 },
    { x: 100, y: 250 },
    { x: 300, y: 250 },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let newWidth = 550;
        let newHeight = 360;

        if (containerWidth < 640) {
          newWidth = Math.max(Math.min(containerWidth - 16, 500), 320);
          newHeight = Math.floor(newWidth * 0.65);
        } else if (containerWidth < 1024) {
          newWidth = 500;
          newHeight = 350;
        }

        if (dimensions.width !== newWidth || dimensions.height !== newHeight) {
          const scaleX = newWidth / dimensions.width;
          const scaleY = newHeight / dimensions.height;

          setVertices(prev =>
            prev.map(v => ({
              x: v.x * scaleX,
              y: v.y * scaleY,
            }))
          );
        }

        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [dimensions.width, dimensions.height]);

  const calculateAngle = (p1: Point, vertex: Point, p2: Point): number => {
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let angle = Math.abs(angle1 - angle2) * (180 / Math.PI);
    if (angle > 180) angle = 360 - angle;

    return angle;
  };

  const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const handleMouseDown = (index: number) => {
    setDraggingIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingIndex === null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const constrainedX = Math.max(20, Math.min(dimensions.width - 20, x));
    const constrainedY = Math.max(20, Math.min(dimensions.height - 20, y));

    setVertices(prev => {
      const newVertices = [...prev];
      newVertices[draggingIndex] = { x: constrainedX, y: constrainedY };
      return newVertices;
    });
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    e.preventDefault();
    setDraggingIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (draggingIndex === null || !svgRef.current) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const constrainedX = Math.max(20, Math.min(dimensions.width - 20, x));
    const constrainedY = Math.max(20, Math.min(dimensions.height - 20, y));

    setVertices(prev => {
      const newVertices = [...prev];
      newVertices[draggingIndex] = { x: constrainedX, y: constrainedY };
      return newVertices;
    });
  };

  const handleTouchEnd = () => {
    setDraggingIndex(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setDraggingIndex(null);
    const handleGlobalTouchEnd = () => setDraggingIndex(null);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  const [A, B, C] = vertices;

  const scale = dimensions.width / 550;
  const fontSize = Math.max(Math.floor(14 * scale), 10);
  const largeFontSize = Math.max(Math.floor(16 * scale), 11);

  const angleA = calculateAngle(B, A, C);
  const angleB = calculateAngle(A, B, C);
  const angleC = calculateAngle(A, C, B);

  const sideAB = calculateDistance(A, B);
  const sideBC = calculateDistance(B, C);
  const sideCA = calculateDistance(C, A);

  const getExteriorPoint = () => {
    const direction = {
      x: C.x - B.x,
      y: C.y - B.y,
    };
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const normalized = { x: direction.x / length, y: direction.y / length };
    return {
      x: C.x + normalized.x * 80,
      y: C.y + normalized.y * 80,
    };
  };

  const drawAngleArc = (
    vertex: Point,
    point1: Point,
    point2: Point,
    radius: number
  ): string => {
    const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x);
    const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x);

    const startX = vertex.x + radius * Math.cos(angle1);
    const startY = vertex.y + radius * Math.sin(angle1);
    const endX = vertex.x + radius * Math.cos(angle2);
    const endY = vertex.y + radius * Math.sin(angle2);

    let angleDiff = angle2 - angle1;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const largeArcFlag = Math.abs(angleDiff) > Math.PI ? 1 : 0;
    const sweepFlag = angleDiff > 0 ? 1 : 0;

    return `M ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${endX},${endY}`;
  };

  const getAngleLabelPosition = (
    vertex: Point,
    point1: Point,
    point2: Point,
    distance: number
  ): Point => {
    const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x);
    const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x);

    let angleDiff = angle2 - angle1;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const bisectorAngle = angle1 + angleDiff / 2;

    return {
      x: vertex.x + distance * Math.cos(bisectorAngle),
      y: vertex.y + distance * Math.sin(bisectorAngle),
    };
  };

  const getSideLabelTransform = (
    point1: Point,
    point2: Point,
    offset: number
  ): { x: number; y: number; angle: number } => {
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;

    const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
    const angleDeg = (angle * 180) / Math.PI;

    const perpAngle = angle + Math.PI / 2;
    const offsetX = offset * Math.cos(perpAngle);
    const offsetY = offset * Math.sin(perpAngle);

    return {
      x: midX + offsetX,
      y: midY + offsetY,
      angle: angleDeg,
    };
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg"
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-300 dark:border-gray-600 rounded cursor-move max-w-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />

        {type === 'angles' && (
          <>
            <path
              d={drawAngleArc(A, B, C, 25)}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />
            <path
              d={drawAngleArc(B, C, A, 25)}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
            />
            <path
              d={drawAngleArc(C, A, B, 25)}
              fill="none"
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
            />

            <text
              x={getAngleLabelPosition(A, B, C, 45 * scale).x}
              y={getAngleLabelPosition(A, B, C, 45 * scale).y}
              fontSize={fontSize}
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {angleA.toFixed(0)}°
            </text>
            <text
              x={getAngleLabelPosition(B, C, A, 45 * scale).x}
              y={getAngleLabelPosition(B, C, A, 45 * scale).y}
              fontSize={fontSize}
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {angleB.toFixed(0)}°
            </text>
            <text
              x={getAngleLabelPosition(C, A, B, 45 * scale).x}
              y={getAngleLabelPosition(C, A, B, 45 * scale).y}
              fontSize={fontSize}
              fill="rgb(168, 85, 247)"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {angleC.toFixed(0)}°
            </text>

            <text
              x="10"
              y={dimensions.height - 20}
              fontSize={largeFontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              {angleA.toFixed(0)} + {angleB.toFixed(0)} + {angleC.toFixed(0)} ={' '}
              {(angleA + angleB + angleC).toFixed(0)}°
            </text>
          </>
        )}

        {type === 'exterior' && (
          <>
            {(() => {
              const D = getExteriorPoint();
              return (
                <>
                  <line
                    x1={B.x}
                    y1={B.y}
                    x2={D.x}
                    y2={D.y}
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <path
                    d={drawAngleArc(C, A, D, 30)}
                    fill="none"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2"
                  />
                  <path
                    d={drawAngleArc(A, B, C, 25)}
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="2"
                  />
                  <path
                    d={drawAngleArc(B, C, A, 25)}
                    fill="none"
                    stroke="rgb(168, 85, 247)"
                    strokeWidth="2"
                  />
                  <text
                    x={getAngleLabelPosition(C, A, D, 50 * scale).x}
                    y={getAngleLabelPosition(C, A, D, 50 * scale).y}
                    fontSize={fontSize}
                    fill="rgb(239, 68, 68)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {(180 - angleC).toFixed(0)}° (външен)
                  </text>
                  <text
                    x={getAngleLabelPosition(A, B, C, 45 * scale).x}
                    y={getAngleLabelPosition(A, B, C, 45 * scale).y}
                    fontSize={fontSize}
                    fill="rgb(34, 197, 94)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {angleB.toFixed(0)}°
                  </text>
                  <text
                    x={getAngleLabelPosition(B, C, A, 45 * scale).x}
                    y={getAngleLabelPosition(B, C, A, 45 * scale).y}
                    fontSize={fontSize}
                    fill="rgb(168, 85, 247)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {angleC.toFixed(0)}°
                  </text>

                  <text
                    x="10"
                    y={dimensions.height - 20}
                    fontSize={fontSize}
                    fill="currentColor"
                    fontWeight="bold"
                  >
                    Външен ъгъл: {angleA.toFixed(0)}° + {angleB.toFixed(0)}° ={' '}
                    {(angleA + angleB).toFixed(0)}°
                  </text>
                </>
              );
            })()}
          </>
        )}

        {type === 'inequality' && (
          <>
            {(() => {
              const labelAB = getSideLabelTransform(A, B, 20);
              const labelBC = getSideLabelTransform(B, C, 20);
              const labelCA = getSideLabelTransform(C, A, 20);

              return (
                <>
                  <text
                    x={labelAB.x}
                    y={labelAB.y}
                    fontSize={fontSize}
                    fill="rgb(239, 68, 68)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${labelAB.angle > 90 || labelAB.angle < -90 ? labelAB.angle + 180 : labelAB.angle}, ${labelAB.x}, ${labelAB.y})`}
                  >
                    c = {sideAB.toFixed(0)}
                  </text>
                  <text
                    x={labelBC.x}
                    y={labelBC.y}
                    fontSize={fontSize}
                    fill="rgb(34, 197, 94)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${labelBC.angle > 90 || labelBC.angle < -90 ? labelBC.angle + 180 : labelBC.angle}, ${labelBC.x}, ${labelBC.y})`}
                  >
                    a = {sideBC.toFixed(0)}
                  </text>
                  <text
                    x={labelCA.x}
                    y={labelCA.y}
                    fontSize={fontSize}
                    fill="rgb(168, 85, 247)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${labelCA.angle > 90 || labelCA.angle < -90 ? labelCA.angle + 180 : labelCA.angle}, ${labelCA.x}, ${labelCA.y})`}
                  >
                    b = {sideCA.toFixed(0)}
                  </text>
                </>
              );
            })()}

            <text
              x="10"
              y={dimensions.height - 50}
              fontSize={Math.max(Math.floor(12 * scale), 9)}
              fill="currentColor"
              fontWeight="bold"
            >
              b + c = {sideCA.toFixed(0)} + {sideAB.toFixed(0)} ={' '}
              {(sideCA + sideAB).toFixed(0)} &gt; {sideBC.toFixed(0)} = a ✓
            </text>
            <text
              x="10"
              y={dimensions.height - 35}
              fontSize={Math.max(Math.floor(12 * scale), 9)}
              fill="currentColor"
              fontWeight="bold"
            >
              a + b = {sideBC.toFixed(0)} + {sideCA.toFixed(0)} ={' '}
              {(sideBC + sideCA).toFixed(0)} &gt; {sideAB.toFixed(0)} = c ✓
            </text>
            <text
              x="10"
              y={dimensions.height - 20}
              fontSize={Math.max(Math.floor(12 * scale), 9)}
              fill="currentColor"
              fontWeight="bold"
            >
              a + c = {sideBC.toFixed(0)} + {sideAB.toFixed(0)} ={' '}
              {(sideBC + sideAB).toFixed(0)} &gt; {sideCA.toFixed(0)} = b ✓
            </text>
          </>
        )}

        {vertices.map((vertex, index) => (
          <circle
            key={index}
            cx={vertex.x}
            cy={vertex.y}
            r="8"
            fill={
              draggingIndex === index ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
            }
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer"
            onMouseDown={() => handleMouseDown(index)}
            onTouchStart={e => handleTouchStart(index, e)}
          />
        ))}

        <text
          x={A.x - 20 * scale}
          y={A.y - 10 * scale}
          fontSize={largeFontSize}
          fontWeight="bold"
          fill="currentColor"
        >
          A
        </text>
        <text
          x={B.x - 20 * scale}
          y={B.y + 20 * scale}
          fontSize={largeFontSize}
          fontWeight="bold"
          fill="currentColor"
        >
          B
        </text>
        <text
          x={C.x + 15 * scale}
          y={C.y + 20 * scale}
          fontSize={largeFontSize}
          fontWeight="bold"
          fill="currentColor"
        >
          C
        </text>
      </svg>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        💡 Плъзнете или докоснете върховете на триъгълника, за да променяте
        неговата форма
      </p>
    </div>
  );
}
