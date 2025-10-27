import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface InteractiveQuadrangleProps {
  type: 'rectangle' | 'square' | 'parallelogram' | 'rhombus' | 'trapezoid';
}

export function InteractiveQuadrangle({ type }: InteractiveQuadrangleProps) {
  const [dimensions, setDimensions] = useState({ width: 550, height: 400 });

  const getInitialVertices = (shapeType: string): Point[] => {
    const centerX = 275;
    const centerY = 190;

    switch (shapeType) {
      case 'square': {
        const squareSize = 90;
        return [
          { x: centerX - squareSize, y: centerY - squareSize },
          { x: centerX + squareSize, y: centerY - squareSize },
          { x: centerX + squareSize, y: centerY + squareSize },
          { x: centerX - squareSize, y: centerY + squareSize },
        ];
      }
      case 'rhombus':
        return [
          { x: centerX, y: centerY - 100 },
          { x: centerX + 80, y: centerY },
          { x: centerX, y: centerY + 100 },
          { x: centerX - 80, y: centerY },
        ];
      case 'parallelogram':
        return [
          { x: 150, y: 120 },
          { x: 370, y: 120 },
          { x: 420, y: 260 },
          { x: 200, y: 260 },
        ];
      case 'trapezoid':
        return [
          { x: 150, y: 260 },
          { x: 200, y: 120 },
          { x: 350, y: 120 },
          { x: 400, y: 260 },
        ];
      default: // rectangle
        return [
          { x: 150, y: 100 },
          { x: 400, y: 100 },
          { x: 400, y: 280 },
          { x: 150, y: 280 },
        ];
    }
  };

  const [vertices, setVertices] = useState<Point[]>(getInitialVertices(type));
  const [dragging, setDragging] = useState<number | null>(null);
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

          setVertices(prev =>
            prev.map(v => ({ x: v.x * scaleX, y: v.y * scaleY }))
          );
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

  const calculateArea = (): number => {
    // Using shoelace formula
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }
    return Math.abs(area / 2);
  };

  const calculatePerimeter = (): number => {
    let perimeter = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      perimeter += calculateDistance(vertices[i], vertices[j]);
    }
    return perimeter;
  };

  const constrainRectangle = (index: number, point: Point): Point[] => {
    const newVertices = [...vertices];
    const clampedX = Math.max(50, Math.min(dimensions.width - 50, point.x));
    const clampedY = Math.max(50, Math.min(dimensions.height - 100, point.y));

    if (index === 0) {
      newVertices[0] = { x: clampedX, y: clampedY };
      newVertices[1] = { x: newVertices[1].x, y: clampedY };
      newVertices[3] = { x: clampedX, y: newVertices[3].y };
    } else if (index === 1) {
      newVertices[1] = { x: clampedX, y: clampedY };
      newVertices[0] = { x: newVertices[0].x, y: clampedY };
      newVertices[2] = { x: clampedX, y: newVertices[2].y };
    } else if (index === 2) {
      newVertices[2] = { x: clampedX, y: clampedY };
      newVertices[1] = { x: clampedX, y: newVertices[1].y };
      newVertices[3] = { x: newVertices[3].x, y: clampedY };
    } else {
      newVertices[3] = { x: clampedX, y: clampedY };
      newVertices[0] = { x: clampedX, y: newVertices[0].y };
      newVertices[2] = { x: newVertices[2].x, y: clampedY };
    }
    return newVertices;
  };

  const constrainSquare = (_index: number, point: Point): Point[] => {
    const newVertices = [...vertices];
    const clampedX = Math.max(50, Math.min(dimensions.width - 50, point.x));
    const clampedY = Math.max(50, Math.min(dimensions.height - 100, point.y));

    const centerX = (vertices[0].x + vertices[2].x) / 2;
    const centerY = (vertices[0].y + vertices[2].y) / 2;

    // Calculate the distance from center and use the larger dimension
    const dx = clampedX - centerX;
    const dy = clampedY - centerY;
    const size = Math.max(Math.abs(dx), Math.abs(dy));

    // Set all vertices to maintain a square shape
    newVertices[0] = { x: centerX - size, y: centerY - size };
    newVertices[1] = { x: centerX + size, y: centerY - size };
    newVertices[2] = { x: centerX + size, y: centerY + size };
    newVertices[3] = { x: centerX - size, y: centerY + size };

    return newVertices;
  };

  const constrainParallelogram = (index: number, point: Point): Point[] => {
    const newVertices = [...vertices];
    const clampedX = Math.max(50, Math.min(dimensions.width - 50, point.x));
    const clampedY = Math.max(50, Math.min(dimensions.height - 100, point.y));

    if (index === 0) {
      const dx = clampedX - vertices[0].x;
      const dy = clampedY - vertices[0].y;
      newVertices[0] = { x: clampedX, y: clampedY };
      newVertices[3] = { x: vertices[3].x + dx, y: vertices[3].y + dy };
    } else if (index === 1) {
      newVertices[1] = { x: clampedX, y: clampedY };
      const dx = vertices[1].x - vertices[0].x;
      const dy = vertices[1].y - vertices[0].y;
      newVertices[2] = { x: vertices[3].x + dx, y: vertices[3].y + dy };
    } else if (index === 2) {
      const dx = clampedX - vertices[2].x;
      const dy = clampedY - vertices[2].y;
      newVertices[2] = { x: clampedX, y: clampedY };
      newVertices[3] = { x: vertices[3].x + dx, y: vertices[3].y + dy };
    } else {
      newVertices[3] = { x: clampedX, y: clampedY };
      const dx = vertices[1].x - vertices[0].x;
      const dy = vertices[1].y - vertices[0].y;
      newVertices[2] = { x: clampedX + dx, y: clampedY + dy };
    }
    return newVertices;
  };

  const constrainRhombus = (index: number, point: Point): Point[] => {
    const newVertices = [...vertices];
    const clampedX = Math.max(50, Math.min(dimensions.width - 50, point.x));
    const clampedY = Math.max(50, Math.min(dimensions.height - 100, point.y));

    const centerX = (vertices[0].x + vertices[2].x) / 2;
    const centerY = (vertices[0].y + vertices[2].y) / 2;

    // Rhombus vertices are arranged as: 0=top, 1=right, 2=bottom, 3=left
    // Diagonals: 0-2 (vertical) and 1-3 (horizontal)

    if (index === 0 || index === 2) {
      // Moving vertical diagonal
      newVertices[index] = { x: clampedX, y: clampedY };
      const oppositeIndex = index === 0 ? 2 : 0;
      // Keep opposite vertex on same line through center
      newVertices[oppositeIndex] = {
        x: 2 * centerX - clampedX,
        y: 2 * centerY - clampedY,
      };
      // Keep horizontal diagonal vertices unchanged
    } else {
      // Moving horizontal diagonal
      newVertices[index] = { x: clampedX, y: clampedY };
      const oppositeIndex = index === 1 ? 3 : 1;
      // Keep opposite vertex on same line through center
      newVertices[oppositeIndex] = {
        x: 2 * centerX - clampedX,
        y: 2 * centerY - clampedY,
      };
      // Keep vertical diagonal vertices unchanged
    }

    return newVertices;
  };

  const constrainTrapezoid = (index: number, point: Point): Point[] => {
    const newVertices = [...vertices];
    const clampedX = Math.max(50, Math.min(dimensions.width - 50, point.x));
    const clampedY = Math.max(50, Math.min(dimensions.height - 100, point.y));

    if (index === 0 || index === 3) {
      // Bottom base
      newVertices[index] = { x: clampedX, y: clampedY };
      if (index === 0) {
        newVertices[3] = { x: vertices[3].x, y: clampedY };
      } else {
        newVertices[0] = { x: vertices[0].x, y: clampedY };
      }
    } else {
      // Top base
      newVertices[index] = { x: clampedX, y: clampedY };
      if (index === 1) {
        newVertices[2] = { x: vertices[2].x, y: clampedY };
      } else {
        newVertices[1] = { x: vertices[1].x, y: clampedY };
      }
    }
    return newVertices;
  };

  const handleMouseDown = (index: number) => {
    setDragging(index);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragging === null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newVertices: Point[];
    switch (type) {
      case 'rectangle':
        newVertices = constrainRectangle(dragging, { x, y });
        break;
      case 'square':
        newVertices = constrainSquare(dragging, { x, y });
        break;
      case 'parallelogram':
        newVertices = constrainParallelogram(dragging, { x, y });
        break;
      case 'rhombus':
        newVertices = constrainRhombus(dragging, { x, y });
        break;
      case 'trapezoid':
        newVertices = constrainTrapezoid(dragging, { x, y });
        break;
      default:
        newVertices = vertices;
    }
    setVertices(newVertices);
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(index);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (dragging === null || !svgRef.current) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = svgRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    let newVertices: Point[];
    switch (type) {
      case 'rectangle':
        newVertices = constrainRectangle(dragging, { x, y });
        break;
      case 'square':
        newVertices = constrainSquare(dragging, { x, y });
        break;
      case 'parallelogram':
        newVertices = constrainParallelogram(dragging, { x, y });
        break;
      case 'rhombus':
        newVertices = constrainRhombus(dragging, { x, y });
        break;
      case 'trapezoid':
        newVertices = constrainTrapezoid(dragging, { x, y });
        break;
      default:
        newVertices = vertices;
    }
    setVertices(newVertices);
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

  const area = calculateArea();
  const perimeter = calculatePerimeter();

  // Calculate side lengths
  const sideAB = calculateDistance(vertices[0], vertices[1]);
  const sideBC = calculateDistance(vertices[1], vertices[2]);
  const sideCD = calculateDistance(vertices[2], vertices[3]);
  const sideDA = calculateDistance(vertices[3], vertices[0]);

  // Calculate height for trapezoid
  const height =
    type === 'trapezoid' ? Math.abs(vertices[0].y - vertices[1].y) : 0;

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
        {/* Quadrangle */}
        <polygon
          points={vertices.map(v => `${v.x},${v.y}`).join(' ')}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
        />

        {/* Side labels */}
        <text
          x={(vertices[0].x + vertices[1].x) / 2}
          y={(vertices[0].y + vertices[1].y) / 2 - 10}
          fontSize={fontSize}
          fill="rgb(34, 197, 94)"
          fontWeight="bold"
          textAnchor="middle"
        >
          {type === 'square' ? 'a' : 'a'} = {sideAB.toFixed(0)}
        </text>
        <text
          x={(vertices[1].x + vertices[2].x) / 2 + 15}
          y={(vertices[1].y + vertices[2].y) / 2}
          fontSize={fontSize}
          fill="rgb(34, 197, 94)"
          fontWeight="bold"
          textAnchor="middle"
        >
          {type === 'square'
            ? 'a'
            : type === 'rectangle'
              ? 'b'
              : type === 'rhombus'
                ? 'a'
                : 'b'}{' '}
          = {sideBC.toFixed(0)}
        </text>
        <text
          x={(vertices[2].x + vertices[3].x) / 2}
          y={(vertices[2].y + vertices[3].y) / 2 + 20}
          fontSize={fontSize}
          fill="rgb(34, 197, 94)"
          fontWeight="bold"
          textAnchor="middle"
        >
          {type === 'square'
            ? 'a'
            : type === 'trapezoid'
              ? 'c'
              : type === 'rhombus'
                ? 'a'
                : 'a'}{' '}
          = {sideCD.toFixed(0)}
        </text>
        <text
          x={(vertices[3].x + vertices[0].x) / 2 - 15}
          y={(vertices[3].y + vertices[0].y) / 2}
          fontSize={fontSize}
          fill="rgb(34, 197, 94)"
          fontWeight="bold"
          textAnchor="middle"
        >
          {type === 'square'
            ? 'a'
            : type === 'rectangle'
              ? 'b'
              : type === 'trapezoid'
                ? 'd'
                : type === 'rhombus'
                  ? 'a'
                  : 'b'}{' '}
          = {sideDA.toFixed(0)}
        </text>

        {/* Height line for trapezoid */}
        {type === 'trapezoid' && (
          <>
            <line
              x1={(vertices[0].x + vertices[3].x) / 2}
              y1={vertices[0].y}
              x2={(vertices[0].x + vertices[3].x) / 2}
              y2={vertices[1].y}
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x={(vertices[0].x + vertices[3].x) / 2 + 20}
              y={(vertices[0].y + vertices[1].y) / 2}
              fontSize={fontSize}
              fill="rgb(239, 68, 68)"
              fontWeight="bold"
            >
              h = {height.toFixed(0)}
            </text>
          </>
        )}

        {/* Diagonals for rhombus */}
        {type === 'rhombus' && (
          <>
            <line
              x1={vertices[0].x}
              y1={vertices[0].y}
              x2={vertices[2].x}
              y2={vertices[2].y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <line
              x1={vertices[1].x}
              y1={vertices[1].y}
              x2={vertices[3].x}
              y2={vertices[3].y}
              stroke="rgb(168, 85, 247)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </>
        )}

        {/* Info text */}
        <text
          x="10"
          y={dimensions.height - 50}
          fontSize={fontSize}
          fill="currentColor"
          fontWeight="bold"
        >
          Лице: A = {area.toFixed(2)}
        </text>
        <text
          x="10"
          y={dimensions.height - 30}
          fontSize={fontSize}
          fill="currentColor"
          fontWeight="bold"
        >
          Периметър: P = {perimeter.toFixed(2)}
        </text>

        {/* Vertices */}
        {vertices.map((vertex, index) => (
          <g key={index}>
            <circle
              cx={vertex.x}
              cy={vertex.y}
              r="8"
              fill={
                dragging === index ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
              }
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer"
              onMouseDown={() => handleMouseDown(index)}
              onTouchStart={e => handleTouchStart(index, e)}
            />
            <text
              x={vertex.x + 15}
              y={vertex.y - 10}
              fontSize={largeFontSize}
              fontWeight="bold"
              fill="currentColor"
            >
              {String.fromCharCode(65 + index)}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        💡 Плъзнете или докоснете върховете, за да променяте формата
      </p>
    </div>
  );
}
