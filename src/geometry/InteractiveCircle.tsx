import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface InteractiveCircleProps {
  type: 'basic' | 'chord' | 'arc' | 'sector' | 'area-circumference' | 'radian';
}

export function InteractiveCircle({ type }: InteractiveCircleProps) {
  const [dimensions, setDimensions] = useState({ width: 550, height: 400 });
  const [center, setCenter] = useState<Point>({ x: 275, y: 200 });
  const [radius, setRadius] = useState(100);
  const [pointOnCircle, setPointOnCircle] = useState<Point>({ x: 375, y: 200 });
  const [secondPoint, setSecondPoint] = useState<Point>({ x: 225, y: 120 });
  const [dragging, setDragging] = useState<
    'center' | 'radius' | 'point1' | 'point2' | null
  >(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let newWidth = 550;
        let newHeight = 400;

        if (containerWidth < 640) {
          newWidth = Math.max(Math.min(containerWidth - 16, 500), 320);
          newHeight = Math.floor(newWidth * 0.73);
        } else if (containerWidth < 1024) {
          newWidth = 500;
          newHeight = 365;
        }

        if (dimensions.width !== newWidth || dimensions.height !== newHeight) {
          const scaleX = newWidth / dimensions.width;
          const scaleY = newHeight / dimensions.height;

          setCenter(prev => ({ x: prev.x * scaleX, y: prev.y * scaleY }));
          setPointOnCircle(prev => ({
            x: prev.x * scaleX,
            y: prev.y * scaleY,
          }));
          setSecondPoint(prev => ({ x: prev.x * scaleX, y: prev.y * scaleY }));
          setRadius(prev => prev * scaleX);
        }

        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [dimensions.width, dimensions.height]);

  const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculateAngle = (p: Point, center: Point): number => {
    return Math.atan2(p.y - center.y, p.x - center.x);
  };

  const constrainToCircle = (
    point: Point,
    center: Point,
    radius: number
  ): Point => {
    const angle = calculateAngle(point, center);
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  };

  const handleMouseDown = (type: 'center' | 'radius' | 'point1' | 'point2') => {
    setDragging(type);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragging === 'center') {
      const maxRadius = Math.min(dimensions.width, dimensions.height) / 2 - 30;
      const newCenter = {
        x: Math.max(maxRadius, Math.min(dimensions.width - maxRadius, x)),
        y: Math.max(maxRadius, Math.min(dimensions.height - 50 - maxRadius, y)),
      };
      const offset = { x: newCenter.x - center.x, y: newCenter.y - center.y };
      setCenter(newCenter);
      setPointOnCircle(prev => ({
        x: prev.x + offset.x,
        y: prev.y + offset.y,
      }));
      setSecondPoint(prev => ({ x: prev.x + offset.x, y: prev.y + offset.y }));
    } else if (dragging === 'radius') {
      const newRadius = calculateDistance(center, { x, y });
      const maxRadius = Math.min(
        center.x - 20,
        dimensions.width - center.x - 20,
        center.y - 20,
        dimensions.height - 50 - center.y
      );
      const clampedRadius = Math.min(Math.max(30, newRadius), maxRadius);
      setRadius(clampedRadius);
      setPointOnCircle(constrainToCircle({ x, y }, center, clampedRadius));
      setSecondPoint(constrainToCircle(secondPoint, center, clampedRadius));
    } else if (dragging === 'point1') {
      setPointOnCircle(constrainToCircle({ x, y }, center, radius));
    } else if (dragging === 'point2') {
      setSecondPoint(constrainToCircle({ x, y }, center, radius));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleTouchStart = (
    type: 'center' | 'radius' | 'point1' | 'point2',
    e: React.TouchEvent
  ) => {
    e.preventDefault();
    setDragging(type);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (dragging === 'center') {
      const maxRadius = Math.min(dimensions.width, dimensions.height) / 2 - 30;
      const newCenter = {
        x: Math.max(maxRadius, Math.min(dimensions.width - maxRadius, x)),
        y: Math.max(maxRadius, Math.min(dimensions.height - 50 - maxRadius, y)),
      };
      const offset = { x: newCenter.x - center.x, y: newCenter.y - center.y };
      setCenter(newCenter);
      setPointOnCircle(prev => ({
        x: prev.x + offset.x,
        y: prev.y + offset.y,
      }));
      setSecondPoint(prev => ({ x: prev.x + offset.x, y: prev.y + offset.y }));
    } else if (dragging === 'radius') {
      const newRadius = calculateDistance(center, { x, y });
      const maxRadius = Math.min(
        center.x - 20,
        dimensions.width - center.x - 20,
        center.y - 20,
        dimensions.height - 50 - center.y
      );
      const clampedRadius = Math.min(Math.max(30, newRadius), maxRadius);
      setRadius(clampedRadius);
      setPointOnCircle(constrainToCircle({ x, y }, center, clampedRadius));
      setSecondPoint(constrainToCircle(secondPoint, center, clampedRadius));
    } else if (dragging === 'point1') {
      setPointOnCircle(constrainToCircle({ x, y }, center, radius));
    } else if (dragging === 'point2') {
      setSecondPoint(constrainToCircle({ x, y }, center, radius));
    }
  };

  const handleTouchEnd = () => {
    setDragging(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setDragging(null);
    const handleGlobalTouchEnd = () => setDragging(null);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, []);

  const scale = dimensions.width / 550;
  const fontSize = Math.max(Math.floor(14 * scale), 10);
  const largeFontSize = Math.max(Math.floor(16 * scale), 11);

  // Calculate arc angle
  const angle1 = calculateAngle(pointOnCircle, center);
  const angle2 = calculateAngle(secondPoint, center);

  // Ensure points are exactly on the circle for accurate rendering
  const exactPoint1 = {
    x: center.x + radius * Math.cos(angle1),
    y: center.y + radius * Math.sin(angle1),
  };
  const exactPoint2 = {
    x: center.x + radius * Math.cos(angle2),
    y: center.y + radius * Math.sin(angle2),
  };

  // Calculate the arc angle going counter-clockwise from point A to point B
  let arcAngle = ((angle2 - angle1) * 180) / Math.PI;
  if (arcAngle < 0) arcAngle += 360;

  // Calculate chord length
  const chordLength = calculateDistance(exactPoint1, exactPoint2);

  // Calculate arc length
  const arcLength = (arcAngle * Math.PI * radius) / 180;

  // Calculate sector area
  const sectorArea = (arcAngle * Math.PI * radius * radius) / 360;

  // For drawing the arc - determine if we should take the longer path
  const largeArcFlag = arcAngle > 180 ? 1 : 0;
  // Sweep flag: 1 for counter-clockwise (positive angle direction)
  const sweepFlag = 1;

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
        {/* Circle */}
        <circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />

        {type === 'basic' && (
          <>
            {/* Radius line */}
            <line
              x1={center.x}
              y1={center.y}
              x2={pointOnCircle.x}
              y2={pointOnCircle.y}
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />

            {/* Diameter line */}
            <line
              x1={center.x - radius}
              y1={center.y}
              x2={center.x + radius}
              y2={center.y}
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
            />

            {/* Radius label */}
            <text
              x={(center.x + pointOnCircle.x) / 2}
              y={(center.y + pointOnCircle.y) / 2 - 10}
              fontSize={fontSize}
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
              textAnchor="middle"
            >
              r = {radius.toFixed(0)}
            </text>

            {/* Diameter label */}
            <text
              x={center.x}
              y={center.y - radius - 15}
              fontSize={fontSize}
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
              textAnchor="middle"
            >
              d = {(2 * radius).toFixed(0)}
            </text>

            {/* Formulas */}
            <text
              x="10"
              y={dimensions.height - 50}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Обиколка: C = 2πr = {(2 * Math.PI * radius).toFixed(2)}
            </text>
            <text
              x="10"
              y={dimensions.height - 30}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Лице: A = πr² = {(Math.PI * radius * radius).toFixed(2)}
            </text>
          </>
        )}

        {type === 'chord' && (
          <>
            {/* Chord */}
            <line
              x1={exactPoint1.x}
              y1={exactPoint1.y}
              x2={exactPoint2.x}
              y2={exactPoint2.y}
              stroke="rgb(239, 68, 68)"
              strokeWidth="3"
            />

            {/* Radii to chord endpoints */}
            <line
              x1={center.x}
              y1={center.y}
              x2={pointOnCircle.x}
              y2={pointOnCircle.y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <line
              x1={center.x}
              y1={center.y}
              x2={secondPoint.x}
              y2={secondPoint.y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Perpendicular from center to chord */}
            {(() => {
              const midChord = {
                x: (exactPoint1.x + exactPoint2.x) / 2,
                y: (exactPoint1.y + exactPoint2.y) / 2,
              };
              const distToChord = calculateDistance(center, midChord);
              return (
                <>
                  <line
                    x1={center.x}
                    y1={center.y}
                    x2={midChord.x}
                    y2={midChord.y}
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="2"
                  />
                  <circle
                    cx={midChord.x}
                    cy={midChord.y}
                    r="4"
                    fill="rgb(34, 197, 94)"
                  />
                  <text
                    x={midChord.x + 15}
                    y={midChord.y - 10}
                    fontSize={fontSize}
                    fill="rgb(34, 197, 94)"
                    fontWeight="bold"
                  >
                    h = {distToChord.toFixed(0)}
                  </text>
                </>
              );
            })()}

            {/* Chord label */}
            <text
              x={(exactPoint1.x + exactPoint2.x) / 2}
              y={(exactPoint1.y + exactPoint2.y) / 2 + 20}
              fontSize={fontSize}
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
              textAnchor="middle"
            >
              хорда = {chordLength.toFixed(0)}
            </text>

            <text
              x="10"
              y={dimensions.height - 30}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Хорда: отсечка свързваща две точки на кръга
            </text>
          </>
        )}

        {type === 'arc' && (
          <>
            {/* Arc (highlighted) */}
            <path
              d={`M ${exactPoint1.x},${exactPoint1.y} A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${exactPoint2.x},${exactPoint2.y}`}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="4"
            />

            {/* Radii */}
            <line
              x1={center.x}
              y1={center.y}
              x2={pointOnCircle.x}
              y2={pointOnCircle.y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <line
              x1={center.x}
              y1={center.y}
              x2={secondPoint.x}
              y2={secondPoint.y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Central angle arc */}
            <path
              d={`M ${center.x + 30 * Math.cos(angle1)},${center.y + 30 * Math.sin(angle1)} A 30,30 0 ${largeArcFlag},${sweepFlag} ${center.x + 30 * Math.cos(angle2)},${center.y + 30 * Math.sin(angle2)}`}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
            />

            {/* Angle label */}
            <text
              x={center.x + 50 * Math.cos((angle1 + angle2) / 2)}
              y={center.y + 50 * Math.sin((angle1 + angle2) / 2)}
              fontSize={fontSize}
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
              textAnchor="middle"
            >
              {arcAngle.toFixed(0)}°
            </text>

            <text
              x="10"
              y={dimensions.height - 50}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Ъгъл: {arcAngle.toFixed(1)}° ={' '}
              {((arcAngle * Math.PI) / 180).toFixed(3)} рад
            </text>
            <text
              x="10"
              y={dimensions.height - 30}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Дължина на дъга: L = (θ/360°) × 2πr = {arcLength.toFixed(2)}
            </text>
          </>
        )}

        {type === 'sector' && (
          <>
            {/* Sector (filled) */}
            <path
              d={`M ${center.x},${center.y} L ${exactPoint1.x},${exactPoint1.y} A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${exactPoint2.x},${exactPoint2.y} Z`}
              fill="rgba(239, 68, 68, 0.3)"
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />

            {/* Radii */}
            <line
              x1={center.x}
              y1={center.y}
              x2={pointOnCircle.x}
              y2={pointOnCircle.y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
            />
            <line
              x1={center.x}
              y1={center.y}
              x2={secondPoint.x}
              y2={secondPoint.y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
            />

            {/* Central angle arc */}
            <path
              d={`M ${center.x + 35 * Math.cos(angle1)},${center.y + 35 * Math.sin(angle1)} A 35,35 0 ${largeArcFlag},${sweepFlag} ${center.x + 35 * Math.cos(angle2)},${center.y + 35 * Math.sin(angle2)}`}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
            />

            {/* Angle label */}
            <text
              x={center.x + 55 * Math.cos((angle1 + angle2) / 2)}
              y={center.y + 55 * Math.sin((angle1 + angle2) / 2)}
              fontSize={fontSize}
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
              textAnchor="middle"
            >
              {arcAngle.toFixed(0)}°
            </text>

            <text
              x="10"
              y={dimensions.height - 50}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Ъгъл на сектора: {arcAngle.toFixed(1)}°
            </text>
            <text
              x="10"
              y={dimensions.height - 30}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Лице на сектора: A = (θ/360°) × πr² = {sectorArea.toFixed(2)}
            </text>
          </>
        )}

        {type === 'area-circumference' && (
          <>
            {/* Filled circle to show area */}
            <circle
              cx={center.x}
              cy={center.y}
              r={radius}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="3"
            />

            {/* Radius line */}
            <line
              x1={center.x}
              y1={center.y}
              x2={pointOnCircle.x}
              y2={pointOnCircle.y}
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />

            {/* Radius label */}
            <text
              x={(center.x + pointOnCircle.x) / 2}
              y={(center.y + pointOnCircle.y) / 2 - 10}
              fontSize={fontSize}
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
              textAnchor="middle"
            >
              r = {radius.toFixed(0)}
            </text>

            {/* Formulas */}
            <text
              x="10"
              y={dimensions.height - 70}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Радиус: r = {radius.toFixed(0)}
            </text>
            <text
              x="10"
              y={dimensions.height - 50}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Обиколка: C = 2πr = {(2 * Math.PI * radius).toFixed(2)}
            </text>
            <text
              x="10"
              y={dimensions.height - 30}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Лице: A = πr² = {(Math.PI * radius * radius).toFixed(2)}
            </text>
          </>
        )}

        {type === 'radian' && (
          <>
            {/* Arc for 1 radian */}
            <path
              d={`M ${exactPoint1.x},${exactPoint1.y} A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${exactPoint2.x},${exactPoint2.y}`}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="4"
            />

            {/* Radii */}
            <line
              x1={center.x}
              y1={center.y}
              x2={exactPoint1.x}
              y2={exactPoint1.y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
            />
            <line
              x1={center.x}
              y1={center.y}
              x2={exactPoint2.x}
              y2={exactPoint2.y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
            />

            {/* Show arc length equals radius */}
            <text
              x={(exactPoint1.x + exactPoint2.x) / 2}
              y={(exactPoint1.y + exactPoint2.y) / 2 - 25}
              fontSize={fontSize}
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
              textAnchor="middle"
            >
              дължина = {arcLength.toFixed(0)}{' '}
              {Math.abs(arcLength - radius) < 2 ? '≈ r' : ''}
            </text>

            {/* Central angle arc */}
            <path
              d={`M ${center.x + 30 * Math.cos(angle1)},${center.y + 30 * Math.sin(angle1)} A 30,30 0 ${largeArcFlag},${sweepFlag} ${center.x + 30 * Math.cos(angle2)},${center.y + 30 * Math.sin(angle2)}`}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2"
            />

            {/* Angle label */}
            <text
              x={center.x + 50 * Math.cos((angle1 + angle2) / 2)}
              y={center.y + 50 * Math.sin((angle1 + angle2) / 2)}
              fontSize={fontSize}
              fill="rgb(34, 197, 94)"
              fontWeight="bold"
              textAnchor="middle"
            >
              {arcAngle.toFixed(1)}°
            </text>

            <text
              x="10"
              y={dimensions.height - 70}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Радиус: r = {radius.toFixed(0)}
            </text>
            <text
              x="10"
              y={dimensions.height - 50}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Ъгъл: {arcAngle.toFixed(1)}° ={' '}
              {((arcAngle * Math.PI) / 180).toFixed(3)} рад
            </text>
            <text
              x="10"
              y={dimensions.height - 30}
              fontSize={fontSize}
              fill="currentColor"
              fontWeight="bold"
            >
              Дължина на дъга: L = {arcLength.toFixed(2)}{' '}
              {Math.abs(arcLength - radius) < 2
                ? '(≈ r, когато θ = 1 рад)'
                : ''}
            </text>
          </>
        )}

        {/* Center point */}
        <circle
          cx={center.x}
          cy={center.y}
          r="6"
          fill={dragging === 'center' ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)'}
          stroke="white"
          strokeWidth="2"
          className="cursor-pointer"
          onMouseDown={() => handleMouseDown('center')}
          onTouchStart={e => handleTouchStart('center', e)}
        />
        <text
          x={center.x + 15}
          y={center.y - 10}
          fontSize={largeFontSize}
          fontWeight="bold"
          fill="currentColor"
        >
          O
        </text>

        {/* Point on circle (for radius or first point) */}
        <circle
          cx={pointOnCircle.x}
          cy={pointOnCircle.y}
          r="8"
          fill={
            dragging === 'point1' || dragging === 'radius'
              ? 'rgb(239, 68, 68)'
              : 'rgb(59, 130, 246)'
          }
          stroke="white"
          strokeWidth="2"
          className="cursor-pointer"
          onMouseDown={() =>
            handleMouseDown(
              type === 'basic' || type === 'area-circumference'
                ? 'radius'
                : 'point1'
            )
          }
          onTouchStart={e =>
            handleTouchStart(
              type === 'basic' || type === 'area-circumference'
                ? 'radius'
                : 'point1',
              e
            )
          }
        />
        <text
          x={pointOnCircle.x + 15}
          y={pointOnCircle.y - 10}
          fontSize={largeFontSize}
          fontWeight="bold"
          fill="currentColor"
        >
          A
        </text>

        {/* Second point (for chord, arc, sector, radian) */}
        {type !== 'basic' && type !== 'area-circumference' && (
          <>
            <circle
              cx={secondPoint.x}
              cy={secondPoint.y}
              r="8"
              fill={
                dragging === 'point2' ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
              }
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer"
              onMouseDown={() => handleMouseDown('point2')}
              onTouchStart={e => handleTouchStart('point2', e)}
            />
            <text
              x={secondPoint.x + 15}
              y={secondPoint.y - 10}
              fontSize={largeFontSize}
              fontWeight="bold"
              fill="currentColor"
            >
              B
            </text>
          </>
        )}
      </svg>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        💡 Плъзнете или докоснете точките, за да променяте{' '}
        {type === 'basic' || type === 'area-circumference'
          ? 'радиуса'
          : type === 'radian'
            ? 'ъгъла'
            : 'формата'}
      </p>
    </div>
  );
}
