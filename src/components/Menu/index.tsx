import React from "react";
import Styles from "../../scss/Menu.module.scss";
import { MenuButtonGitHub } from "./Button/GitHub";
import { MenuButtonReload } from "./Button/Reload";
import { MenuButtonSound } from "./Button/Sound";

export const Menu = () => {
  return (
    <div className={Styles.wrapper}>
      <nav className={Styles.nav}>
        <MenuButtonSound />
        <MenuButtonReload />
        <MenuButtonGitHub />
      </nav>
    </div>
  );
};
