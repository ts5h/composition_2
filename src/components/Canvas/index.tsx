import React, { useCallback, useEffect, useRef } from "react";
import { useDrawLines } from "./useDrawLines";
import { useWindowSize } from "../../hooks/useWindowSize";
import { Menu } from "../Menu";
import { MenuHome } from "../Menu/Home";
import Styles from "../../scss/Canvas.module.scss";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerId = useRef<number | null>(null);

  const { winWidth, winHeight } = useWindowSize();
  const { drawLines, initializeContext, reset } = useDrawLines();

  const handleResize = useCallback(() => {
    if (timerId.current) {
      window.clearTimeout(timerId.current);
    }

    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // NOTE: Do not include winWidth and winHeight in dependencies because the values are not updated properly on resize
    context.canvas.width = winWidth;
    context.canvas.height = winHeight;
    reset();

    timerId.current = window.setTimeout(() => {
      drawLines();
    }, 500);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawLines, reset]);

  // Initialize
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      initializeContext(context);
    }
  }, [initializeContext]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={Styles.canvas}>
      <canvas ref={canvasRef} />
      <MenuHome />
      <Menu />
    </div>
  );
};
