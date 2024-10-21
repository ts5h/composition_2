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

    const tmpPoints = points.map((point) => {
      const radian = point.angle * (Math.PI / 180);
      let newLeft = point.left + Math.cos(radian) * point.speed;
      let newTop = point.top + Math.sin(radian) * point.speed;

      let collisionFlag = false;
      let newAngle = point.angle;

      if (newLeft < point.radius || newLeft > winWidth - point.radius) {
        newAngle = 180 - point.angle;
        collisionFlag = true;

        if (newLeft < point.radius) {
          newLeft = point.radius;
        } else if (newLeft > winWidth - point.radius) {
          newLeft = winWidth - point.radius;
        }
      }

      if (newTop < point.radius || newTop > winHeight - point.radius) {
        newAngle = 360 - point.angle;
        collisionFlag = true;

        if (newTop < point.radius) {
          newTop = point.radius;
        } else if (newTop > winHeight - point.radius) {
          newTop = winHeight - point.radius;
        }
      }

      return {
        radius: point.radius,
        left: newLeft,
        top: newTop,
        angle: newAngle,
        speed: point.speed,
        collisionFlag,
        midiNumber: point.midiNumber,
        isBass: point.isBass,
      } as Point;
    });

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
    const pointsMax = isMobileOnly ? 20 : 80;

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
        speed: isBass
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
