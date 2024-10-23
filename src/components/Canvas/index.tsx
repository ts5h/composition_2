import React, { useCallback, useEffect, useRef } from "react";
import Styles from "../../scss/Canvas.module.scss";
import { Menu } from "../Menu";
import { MenuHome } from "../Menu/Home";
import { useDrawShapes } from "./useDrawShapes";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerId = useRef<number | null>(null);

  const { drawShapes, initializeContext, reset } = useDrawShapes();

  const handleResize = useCallback(() => {
    if (timerId.current) {
      window.clearTimeout(timerId.current);
    }

    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // NOTE: Do not include winWidth and winHeight in dependencies because the values are not updated properly on resize
    context.canvas.width = 5000;
    context.canvas.height = 4000;
    reset();

    timerId.current = window.setTimeout(() => {
      drawShapes();
    }, 500);
  }, [drawShapes, reset]);

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
