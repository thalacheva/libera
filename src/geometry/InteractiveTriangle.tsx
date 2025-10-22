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
              d={`M ${A.x + 20},${A.y} A 20,20 0 0,1 ${A.x},${A.y + 20}`}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="1.5"
            />
            <path
              d={`M ${B.x + 20},${B.y} A 20,20 0 0,0 ${B.x},${B.y - 20}`}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="1.5"
            />
            <path
              d={`M ${C.x - 20},${C.y} A 20,20 0 0,0 ${C.x},${C.y - 20}`}
              fill="none"
              stroke="rgb(168, 85, 247)"
              strokeWidth="1.5"
            />

            {/* Angle labels */}
            <text
              x={A.x - 5}
              y={A.y + 35}
              fontSize="14"
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
            >
              {angleA.toFixed(0)}°
            </text>
            <text
              x={B.x + 25}
              y={B.y - 10}
              fontSize="14"
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
            >
              {angleB.toFixed(0)}°
            </text>
            <text
              x={C.x - 35}
              y={C.y - 10}
              fontSize="14"
              fill="rgb(168, 85, 247)"
              fontWeight="bold"
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
                    d={`M ${C.x + 30},${C.y - 10} A 30,30 0 0,1 ${C.x + 20},${C.y + 20}`}
                    fill="none"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2"
                  />

                  {/* Interior angles at A and B */}
                  <path
                    d={`M ${A.x + 15},${A.y} A 15,15 0 0,1 ${A.x},${A.y + 15}`}
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="1.5"
                  />
                  <path
                    d={`M ${B.x + 15},${B.y} A 15,15 0 0,0 ${B.x},${B.y - 15}`}
                    fill="none"
                    stroke="rgb(168, 85, 247)"
                    strokeWidth="1.5"
                  />

                  {/* Angle labels */}
                  <text
                    x={C.x + 35}
                    y={C.y + 15}
                    fontSize="14"
                    fill="rgb(239, 68, 68)"
                    fontWeight="bold"
                  >
                    {(180 - angleC).toFixed(0)}° (външен)
                  </text>
                  <text
                    x={A.x - 5}
                    y={A.y + 30}
                    fontSize="14"
                    fill="rgb(34, 197, 94)"
                    fontWeight="bold"
                  >
                    {angleA.toFixed(0)}°
                  </text>
                  <text
                    x={B.x + 20}
                    y={B.y - 10}
                    fontSize="14"
                    fill="rgb(168, 85, 247)"
                    fontWeight="bold"
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
            <text
              x={(A.x + B.x) / 2 - 30}
              y={(A.y + B.y) / 2}
              fontSize="14"
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
            >
              c = {sideAB.toFixed(0)}
            </text>
            <text
              x={(B.x + C.x) / 2}
              y={(B.y + C.y) / 2 + 20}
              fontSize="14"
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
            >
              a = {sideBC.toFixed(0)}
            </text>
            <text
              x={(C.x + A.x) / 2 + 20}
              y={(C.y + A.y) / 2}
              fontSize="14"
              fill="rgb(168, 85, 247)"
              fontWeight="bold"
            >
              b = {sideCA.toFixed(0)}
            </text>

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
