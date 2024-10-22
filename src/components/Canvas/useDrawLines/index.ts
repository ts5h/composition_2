import { useCallback, useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import { usePlaySound } from "../usePlaySound";
import { useWindowSize } from "../../../hooks/useWindowSize";

type Point = {
  radius: number;
  left: number;
  top: number;
  angle: number;
  speed: number;
  collisionFlag: boolean;
  isBass: boolean;
  midiNumber: number;
};

export const useDrawLines = () => {
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const [points, setPoints] = useState<Point[]>();

  const requestRef = useRef<number | null>(null);

  const { winWidth, winHeight } = useWindowSize();
  const { playSound } = usePlaySound();

  const lineWidth = 0.4;

  const update = useCallback(() => {
    if (!points) return;

    const tmpPoints: Point[] = [];

    for (let i = 0; i < points.length; i++) {
      const pointA = points[i];
      const radian = pointA.angle * (Math.PI / 180);
      let newLeft = pointA.left + Math.cos(radian) * pointA.speed;
      let newTop = pointA.top + Math.sin(radian) * pointA.speed;

      let collisionFlag = false;
      let newAngle = pointA.angle;

      if (newLeft < pointA.radius || newLeft > winWidth - pointA.radius) {
        newAngle = 180 - pointA.angle;
        collisionFlag = true;

        if (newLeft < pointA.radius) {
          newLeft = pointA.radius;
        } else if (newLeft > winWidth - pointA.radius) {
          newLeft = winWidth - pointA.radius;
        }
      }

      if (newTop < pointA.radius || newTop > winHeight - pointA.radius) {
        newAngle = 360 - pointA.angle;
        collisionFlag = true;

        if (newTop < pointA.radius) {
          newTop = pointA.radius;
        } else if (newTop > winHeight - pointA.radius) {
          newTop = winHeight - pointA.radius;
        }
      }

      for (let j = 0; j < points.length; j++) {
        if (i !== j) {
          const pointB = points[j];

          const xLength = pointB.left - newLeft;
          const yLength = pointB.top - newTop;
          const length = Math.sqrt(xLength ** 2 + yLength ** 2);

          if (length < pointA.radius + pointB.radius) {
            newAngle = Math.atan2(-yLength, -xLength) * (180 / Math.PI);
            pointB.angle = Math.atan2(yLength, xLength) * (180 / Math.PI);

            collisionFlag = true;
            break;
          }
        }
      }

      tmpPoints[i] = {
        radius: pointA.radius,
        left: newLeft,
        top: newTop,
        angle: newAngle,
        speed: pointA.speed,
        collisionFlag,
        midiNumber: pointA.midiNumber,
        isBass: pointA.isBass,
      };
    }

    setPoints(tmpPoints);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const drawLines = useCallback(() => {
    if (!context) return;

    context.clearRect(0, 0, winWidth, winHeight);

    if (points) {
      const maxLength = Math.sqrt(winWidth ** 2 + winHeight ** 2);

      for (let i = 0; i < points.length; i++) {
        const fromPoint = points[i];

        if (fromPoint.collisionFlag) {
          playSound(fromPoint.midiNumber, fromPoint.speed, fromPoint.isBass);
        }

        context.fillStyle = "rgba(68, 68, 68, 0.5)";
        context.strokeStyle = "transparent";

        context.beginPath();
        context.arc(
          fromPoint.left,
          fromPoint.top,
          fromPoint.radius,
          0,
          (360 * Math.PI) / 180,
        );
        context.fill();

        for (let j = i + 1; j < points.length; j++) {
          const toPoint = points[j];

          const xLength = toPoint.left - fromPoint.left;
          const yLength = toPoint.top - fromPoint.top;
          const length = Math.sqrt(xLength ** 2 + yLength ** 2);

          context.fillStyle = "transparent";
          context.strokeStyle = `rgba(68, 68, 68, ${
            (1 - length / maxLength ** 0.83) * 0.9
          })`;
          context.lineWidth = lineWidth;

          context.beginPath();
          context.moveTo(fromPoint.left, fromPoint.top);
          context.lineTo(toPoint.left, toPoint.top);
          context.stroke();
        }
      }
    }

    update();
    requestRef.current = requestAnimationFrame(drawLines);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, playSound, points, update]);

  const reset = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    const slowSpeedMax = isMobileOnly ? 0.9 : 1.9;
    const normalSpeedMax = slowSpeedMax * 3.0;
    const pointsMax = isMobileOnly ? 20 : 40;

    const numberOfPoints = Math.floor(Math.random() * pointsMax) + 40;
    const tmpPoints = [];

    for (let i = 0; i < numberOfPoints; i++) {
      const isBass = Math.random() > 0.92;
      const radius = isBass ? Math.random() * 100 + 1 : Math.random() * 20 + 1;

      const point: Point = {
        radius,
        left: Math.random() * (winWidth - radius * 2) + radius,
        top: Math.random() * (winHeight - radius * 2) + radius,
        angle: Math.random() * 360,
        speed:
          Math.random() > 0.9
            ? Math.random() * slowSpeedMax + 0.1
            : Math.random() * normalSpeedMax + 0.1,
        collisionFlag: false,
        isBass,
        midiNumber: isBass
          ? Math.floor(Math.random() * 32) + 12
          : Math.floor(Math.random() * 32) + 24,
      };

      tmpPoints.push(point);
    }

    setPoints(tmpPoints);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeContext = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, winWidth, winHeight);
    setContext(ctx);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // initialize
  useEffect(() => {
    requestRef.current = requestAnimationFrame(drawLines);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [drawLines]);

  return {
    drawLines,
    initializeContext,
    reset,
  };
};
