import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface InteractiveTriangleProps {
  type: 'angles' | 'exterior' | 'inequality';
}

export default function InteractiveTriangle({
  type,
}: InteractiveTriangleProps) {
  const [vertices, setVertices] = useState<Point[]>([
    { x: 200, y: 50 },
    { x: 100, y: 250 },
    { x: 300, y: 250 },
  ]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

    // Constrain to SVG bounds
    const constrainedX = Math.max(20, Math.min(380, x));
    const constrainedY = Math.max(20, Math.min(280, y));

    setVertices(prev => {
      const newVertices = [...prev];
      newVertices[draggingIndex] = { x: constrainedX, y: constrainedY };
      return newVertices;
    });
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setDraggingIndex(null);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const [A, B, C] = vertices;

  // Calculate angles
  const angleA = calculateAngle(B, A, C);
  const angleB = calculateAngle(A, B, C);
  const angleC = calculateAngle(A, C, B);

  // Calculate side lengths
  const sideAB = calculateDistance(A, B);
  const sideBC = calculateDistance(B, C);
  const sideCA = calculateDistance(C, A);

  // Calculate exterior angle point for theorem 2
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

  // Helper function to draw accurate angle arc
  const drawAngleArc = (
    vertex: Point,
    point1: Point,
    point2: Point,
    radius: number
  ): string => {
    // Calculate angles from vertex to both points
    const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x);
    const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x);

    // Calculate start and end points on the arc
    const startX = vertex.x + radius * Math.cos(angle1);
    const startY = vertex.y + radius * Math.sin(angle1);
    const endX = vertex.x + radius * Math.cos(angle2);
    const endY = vertex.y + radius * Math.sin(angle2);

    // Determine if we should use the large arc flag
    let angleDiff = angle2 - angle1;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const largeArcFlag = Math.abs(angleDiff) > Math.PI ? 1 : 0;
    const sweepFlag = angleDiff > 0 ? 1 : 0;

    return `M ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${endX},${endY}`;
  };

  // Helper function to get label position along angle bisector
  const getAngleLabelPosition = (
    vertex: Point,
    point1: Point,
    point2: Point,
    distance: number
  ): Point => {
    // Calculate angles from vertex to both points
    const angle1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x);
    const angle2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x);

    // Calculate the bisector angle
    let angleDiff = angle2 - angle1;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    const bisectorAngle = angle1 + angleDiff / 2;

    // Position the label along the bisector
    return {
      x: vertex.x + distance * Math.cos(bisectorAngle),
      y: vertex.y + distance * Math.sin(bisectorAngle),
    };
  };

  // Helper function to calculate side label position and rotation
  const getSideLabelTransform = (
    point1: Point,
    point2: Point,
    offset: number
  ): { x: number; y: number; angle: number } => {
    // Midpoint of the side
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;

    // Angle of the side
    const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
    const angleDeg = (angle * 180) / Math.PI;

    // Perpendicular offset
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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
      <svg
        ref={svgRef}
        width="550"
        height="360"
        className="border border-gray-300 dark:border-gray-600 rounded cursor-move"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />

        {type === 'angles' && (
          <>
            {/* Angle arcs */}
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

            {/* Angle labels */}
            <text
              x={getAngleLabelPosition(A, B, C, 45).x}
              y={getAngleLabelPosition(A, B, C, 45).y}
              fontSize="14"
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {angleA.toFixed(0)}°
            </text>
            <text
              x={getAngleLabelPosition(B, C, A, 45).x}
              y={getAngleLabelPosition(B, C, A, 45).y}
              fontSize="14"
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {angleB.toFixed(0)}°
            </text>
            <text
              x={getAngleLabelPosition(C, A, B, 45).x}
              y={getAngleLabelPosition(C, A, B, 45).y}
              fontSize="14"
              fill="rgb(168, 85, 247)"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {angleC.toFixed(0)}°
            </text>

            <text
              x="10"
              y="340"
              fontSize="16"
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
            {/* Extended line for exterior angle */}
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

                  {/* Exterior angle arc */}
                  <path
                    d={drawAngleArc(C, B, D, 30)}
                    fill="none"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2"
                  />

                  {/* Interior angles at A and B */}
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

                  {/* Angle labels */}
                  <text
                    x={getAngleLabelPosition(C, B, D, 50).x}
                    y={getAngleLabelPosition(C, B, D, 50).y}
                    fontSize="14"
                    fill="rgb(239, 68, 68)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {(180 - angleC).toFixed(0)}° (външен)
                  </text>
                  <text
                    x={getAngleLabelPosition(A, B, C, 45).x}
                    y={getAngleLabelPosition(A, B, C, 45).y}
                    fontSize="14"
                    fill="rgb(34, 197, 94)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {angleA.toFixed(0)}°
                  </text>
                  <text
                    x={getAngleLabelPosition(B, C, A, 45).x}
                    y={getAngleLabelPosition(B, C, A, 45).y}
                    fontSize="14"
                    fill="rgb(168, 85, 247)"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {angleB.toFixed(0)}°
                  </text>

                  {/* Equation */}
                  <text
                    x="10"
                    y="340"
                    fontSize="14"
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
            {/* Side labels */}
            {(() => {
              const labelAB = getSideLabelTransform(A, B, 20);
              const labelBC = getSideLabelTransform(B, C, 20);
              const labelCA = getSideLabelTransform(C, A, 20);

              return (
                <>
                  <text
                    x={labelAB.x}
                    y={labelAB.y}
                    fontSize="14"
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
                    fontSize="14"
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
                    fontSize="14"
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

            {/* Inequalities */}
            <text
              x="10"
              y="315"
              fontSize="12"
              fill="currentColor"
              fontWeight="bold"
            >
              b + c = {sideCA.toFixed(0)} + {sideAB.toFixed(0)} ={' '}
              {(sideCA + sideAB).toFixed(0)} &lt; {sideBC.toFixed(0)} = a ✓
            </text>
            <text
              x="10"
              y="330"
              fontSize="12"
              fill="currentColor"
              fontWeight="bold"
            >
              a + b = {sideBC.toFixed(0)} + {sideCA.toFixed(0)} ={' '}
              {(sideBC + sideCA).toFixed(0)} &lt; {sideAB.toFixed(0)} = c ✓
            </text>
            <text
              x="10"
              y="345"
              fontSize="12"
              fill="currentColor"
              fontWeight="bold"
            >
              a + c = {sideBC.toFixed(0)} + {sideAB.toFixed(0)} ={' '}
              {(sideBC + sideAB).toFixed(0)} &lt; {sideCA.toFixed(0)} = b ✓
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
          />
        ))}

        <text
          x={A.x - 20}
          y={A.y - 10}
          fontSize="16"
          fontWeight="bold"
          fill="currentColor"
        >
          A
        </text>
        <text
          x={B.x - 20}
          y={B.y + 20}
          fontSize="16"
          fontWeight="bold"
          fill="currentColor"
        >
          B
        </text>
        <text
          x={C.x + 15}
          y={C.y + 20}
          fontSize="16"
          fontWeight="bold"
          fill="currentColor"
        >
          C
        </text>
      </svg>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        💡 Плъзнете върховете на триъгълника, за да променяте неговата форма
      </p>
    </div>
  );
}
