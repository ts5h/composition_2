import React from "react";
import { MenuButtonSound } from "./Button/Sound";
import { MenuButtonReload } from "./Button/Reload";
import { MenuButtonGitHub } from "./Button/GitHub";
import Styles from "../../scss/Menu.module.scss";

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
