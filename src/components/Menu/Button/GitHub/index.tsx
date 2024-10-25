import React, { useState } from "react";
import { isMobile } from "react-device-detect";
import { AiFillGithub } from "react-icons/ai";
import Styles from "../../../../scss/Menu.module.scss";

export const MenuButtonGitHub = () => {
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
    window.open("https://github.com/ts5h/composition_2");
  };

  return (
    <button
      type="button"
      onMouseOver={() => handleHover(true)}
      onMouseOut={() => handleHover(false)}
      onFocus={() => handleHover(true)}
      onBlur={() => handleHover(false)}
      onTouchStart={() => handleTouch(true)}
      onTouchEnd={() => handleTouch(false)}
      onClick={handleClick}
      className={isHover ? Styles.on : ""}
      title="GitHub"
    >
      <AiFillGithub className={Styles.icon} />
    </button>
  );
};
