import { useCallback, useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import { usePlaySound } from "../usePlaySound";
import { useWindowSize } from "../../../hooks/useWindowSize";

type Point = {
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
  const pointRadius = 1.2;

  const update = useCallback(() => {
    if (!points) return;

    const tmpPoints = points.map((point) => {
      const radian = point.angle * (Math.PI / 180);
      let newLeft = point.left + Math.cos(radian) * point.speed;
      let newTop = point.top + Math.sin(radian) * point.speed;

      let collisionFlag = false;
      let newAngle = point.angle;
      if (newLeft < 0 || newLeft > winWidth) {
        newAngle = 180 - point.angle;
        collisionFlag = true;

        if (newLeft < 0) {
          newLeft = 0;
        } else if (newLeft > winWidth) {
          newLeft = winWidth;
        }
      }

      if (newTop < 0 || newTop > winHeight) {
        newAngle = 360 - point.angle;
        collisionFlag = true;

        if (newTop < 0) {
          newTop = 0;
        } else if (newTop > winHeight) {
          newTop = winHeight;
        }
      }

      return {
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

        context.fillStyle = "rgba(68, 68, 68, 0.75)";
        context.strokeStyle = "transparent";

        context.beginPath();
        context.arc(
          fromPoint.left,
          fromPoint.top,
          pointRadius,
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

    const normalSpeedMax = isMobileOnly ? 0.9 : 1.9;
    const highSpeedMax = isMobileOnly ? 7.4 : 9.9;
    const pointsMax = isMobileOnly ? 20 : 80;

    const numberOfPoints = Math.floor(Math.random() * pointsMax) + 40;
    const tmpPoints = [];

    for (let i = 0; i < numberOfPoints; i++) {
      const isBass = Math.random();
      const point: Point = {
        left: Math.random() * (winWidth - pointRadius * 2) + pointRadius,
        top: Math.random() * (winHeight - pointRadius * 2) + pointRadius,
        angle: Math.random() * 360,
        speed:
          isBass < 0.9
            ? Math.random() * normalSpeedMax + 0.1
            : Math.random() * highSpeedMax + 0.1,
        collisionFlag: false,
        isBass: isBass < 0.9,
        midiNumber:
          isBass < 0.9
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
