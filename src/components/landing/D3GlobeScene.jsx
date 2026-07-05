import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  AIRPLANE_PATH,
  buildCrossOrbitPath,
  buildFlightTrailPath,
  getCrossOrbitPosition,
} from './GlobeAirplane';

/**
 * D3 halftone dot globe — cartographic gold-on-void aesthetic.
 * @param {{ width?: number, height?: number, className?: string, scrollProgress?: number, focusScope?: 'uk' | 'international' }} props
 */
export default function D3GlobeScene({
  width = 800,
  height = 600,
  className = '',
  scrollProgress = 0,
  theme = 'dark',
  focusScope = 'international',
}) {
  const canvasRef = useRef(null);
  const planeRef = useRef(null);
  const flightPathRef = useRef(null);
  const flightTrailRef = useRef(null);
  const scrollRef = useRef(scrollProgress);
  const focusScopeRef = useRef(focusScope);
  const [error, setError] = useState(null);

  scrollRef.current = scrollProgress;
  focusScopeRef.current = focusScope;

  const getGlobeColors = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      ocean: style.getPropertyValue('--globe-ocean').trim() || '#05050f',
      dots: style.getPropertyValue('--globe-dots').trim() || '#c9a84c',
    };
  };

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const containerWidth = width;
    const containerHeight = height;
    const minDim = Math.min(containerWidth, containerHeight);
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const startRadius = minDim * 0.47;
    const endRadius = minDim * 0.13;
    const globeStartX = centerX;
    const globeStartY = centerY;
    const endX = containerWidth * 0.72;
    const endY = containerHeight * 0.44;

    const ease = (t) => t * t * (3 - 2 * t);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    context.scale(dpr, dpr);

    const projection = d3
      .geoOrthographic()
      .scale(startRadius)
      .translate([globeStartX, globeStartY])
      .clipAngle(90);

    const pointInPolygon = (point, polygon) => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    };

    const pointInFeature = (point, feature) => {
      const geometry = feature.geometry;
      if (geometry.type === 'Polygon') {
        const coordinates = geometry.coordinates;
        if (!pointInPolygon(point, coordinates[0])) return false;
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false;
        }
        return true;
      }
      if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false;
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true;
                break;
              }
            }
            if (!inHole) return true;
          }
        }
        return false;
      }
      return false;
    };

    const generateDotsInPolygon = (feature, dotSpacing = 16) => {
      const dots = [];
      const bounds = d3.geoBounds(feature);
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      const stepSize = dotSpacing * 0.08;
      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point = [lng, lat];
          if (pointInFeature(point, feature)) dots.push(point);
        }
      }
      return dots;
    };

    const allDots = [];
    let landFeatures;
    let orbitTime = 0;
    let focusProgress = focusScopeRef.current === 'uk' ? 1 : 0;

    const UK_FOCUS = { lambda: 2, phi: -54, scaleMul: 1.72 };

    const applyScrollTransform = (ukFocus = 0) => {
      const progress = ease(scrollRef.current);
      const scrollScale = startRadius + (endRadius - startRadius) * progress;
      const scale = scrollScale * (1 + (UK_FOCUS.scaleMul - 1) * ukFocus);
      const translateX = globeStartX + (endX - globeStartX) * progress;
      const translateY = globeStartY + (endY - globeStartY) * progress;
      projection.scale(scale).translate([translateX, translateY]);
      return scale / startRadius;
    };

    const updateAirplane = (globeRadius) => {
      const [globeX, globeY] = projection.translate();
      const plane = planeRef.current;
      const flightPath = flightPathRef.current;
      const flightTrail = flightTrailRef.current;
      if (!plane) return;

      const sizeScale = 0.6 + (globeRadius / startRadius) * 0.7;
      const pos = getCrossOrbitPosition(orbitTime, globeX, globeY, globeRadius);

      plane.setAttribute(
        'transform',
        `translate(${pos.x}, ${pos.y}) rotate(${pos.angle}) rotate(${pos.bank}) scale(${sizeScale * pos.scale})`,
      );
      plane.setAttribute('opacity', String(pos.opacity));

      if (flightPath) {
        flightPath.setAttribute('d', buildCrossOrbitPath(globeX, globeY, globeRadius));
        flightPath.setAttribute('stroke-dashoffset', String(-orbitTime * 48));
      }

      if (flightTrail) {
        flightTrail.setAttribute('d', buildFlightTrailPath(orbitTime, globeX, globeY, globeRadius));
        flightTrail.setAttribute('opacity', String(pos.depth < -0.15 ? 0.2 : 0.55));
      }
    };

    const render = (ukFocus = focusProgress) => {
      context.clearRect(0, 0, containerWidth, containerHeight);
      const scaleFactor = applyScrollTransform(ukFocus);
      const currentScale = projection.scale();

      const { ocean, dots } = getGlobeColors();

      context.beginPath();
      context.arc(projection.translate()[0], projection.translate()[1], currentScale, 0, 2 * Math.PI);
      context.fillStyle = ocean;
      context.fill();

      if (landFeatures) {
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat]);
          if (
            projected
            && projected[0] >= 0 && projected[0] <= containerWidth
            && projected[1] >= 0 && projected[1] <= containerHeight
          ) {
            context.beginPath();
            context.arc(projected[0], projected[1], 1.0 * scaleFactor, 0, 2 * Math.PI);
            context.fillStyle = dots;
            context.fill();
          }
        });
      }

      updateAirplane(currentScale);
    };

    const loadWorldData = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json',
        );
        if (!response.ok) throw new Error('Failed to load land data');
        landFeatures = await response.json();
        landFeatures.features.forEach((feature) => {
          const dots = generateDotsInPolygon(feature, 16);
          dots.forEach(([lng, lat]) => allDots.push({ lng, lat }));
        });
        render();
      } catch {
        setError('Failed to load map data');
      }
    };

    const dragRotation = [0, 0];
    let autoRotateOffset = 0;
    let autoRotate = true;
    const rotationSpeed = 0.18;

    const updateProjectionRotation = (ukFocus = focusProgress) => {
      const progress = ease(scrollRef.current);
      const scrollLambda = progress * 90;
      const scrollPhi = -progress * 18;

      const globalLambda = dragRotation[0] + autoRotateOffset + scrollLambda;
      const globalPhi = Math.max(-90, Math.min(90, dragRotation[1] + scrollPhi));
      const lambda = globalLambda * (1 - ukFocus) + UK_FOCUS.lambda * ukFocus;
      const phi = globalPhi * (1 - ukFocus) + UK_FOCUS.phi * ukFocus;

      projection.rotate([lambda, phi]);
    };

    const rotate = (elapsed) => {
      orbitTime = elapsed * 0.00038;
      const focusTarget = focusScopeRef.current === 'uk' ? 1 : 0;
      focusProgress += (focusTarget - focusProgress) * 0.07;

      if (autoRotate && focusProgress < 0.35) {
        autoRotateOffset += rotationSpeed;
      }
      updateProjectionRotation(focusProgress);
      render(focusProgress);
    };

    const rotationTimer = d3.timer(rotate);

    const handleMouseDown = (event) => {
      autoRotate = false;
      const pointerX = event.clientX;
      const pointerY = event.clientY;
      const startRotation = [...dragRotation];
      const handleMouseMove = (moveEvent) => {
        dragRotation[0] = startRotation[0] + (moveEvent.clientX - pointerX) * 0.5;
        dragRotation[1] = Math.max(-90, Math.min(90, startRotation[1] - (moveEvent.clientY - pointerY) * 0.5));
        updateProjectionRotation(focusProgress);
        render(focusProgress);
      };
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        setTimeout(() => { autoRotate = true; }, 800);
      };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    let lastTouchX = 0;
    let lastTouchY = 0;
    const handleTouchStart = (e) => {
      autoRotate = false;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      dragRotation[0] += dx * 0.5;
      dragRotation[1] = Math.max(-90, Math.min(90, dragRotation[1] - dy * 0.5));
      updateProjectionRotation(focusProgress);
      render(focusProgress);
    };
    const handleTouchEnd = () => {
      setTimeout(() => { autoRotate = true; }, 800);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    loadWorldData();

    return () => {
      rotationTimer.stop();
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [width, height, theme]);

  if (error) return null;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'pan-y' }}
      />
      <svg
        className="pointer-events-none absolute inset-0 overflow-visible"
        width={width}
        height={height}
        aria-hidden="true"
      >
        <path ref={flightPathRef} className="globe-flight-path" />
        <path ref={flightTrailRef} className="globe-flight-trail" />
        <g ref={planeRef}>
          <path d={AIRPLANE_PATH} className="globe-plane-icon" />
        </g>
      </svg>
    </div>
  );
}
