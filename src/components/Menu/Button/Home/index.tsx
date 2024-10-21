import React, { useState } from "react";
import { isMobile } from "react-device-detect";
import { ArrowBackToHome } from "../../../../icons";
import Styles from "../../../../scss/MenuHome.module.scss";

export const MenuButtonHome = () => {
  const [isHover, setIsHover] = useState(false);

  const handleHover = (state: boolean) => {
    if (isMobile) return;
    setIsHover(state);
  };

  const handleTouch = (state: boolean) => {
    if (!isMobile) return;
    setIsHover(state);
  };

  const handleClick = () => {
    window.location.href = "/";
  };

  return (
    <button
      type={"button"}
      className={`${Styles.menu} ${isHover ? Styles.on : ""}`}
      onMouseOver={() => handleHover(true)}
      onMouseOut={() => handleHover(false)}
      onFocus={() => handleHover(true)}
      onBlur={() => handleHover(false)}
      onTouchStart={() => handleTouch(true)}
      onTouchEnd={() => handleTouch(false)}
      onClick={handleClick}
    >
      <div className={Styles.icon}>
        <ArrowBackToHome />
      </div>
      <p>HOME</p>
    </button>
  );
};
