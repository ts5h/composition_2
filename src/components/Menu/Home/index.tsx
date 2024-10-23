import React from "react";
import Styles from "../../../scss/MenuHome.module.scss";
import { MenuButtonHome } from "../Button/Home";

export const MenuHome = () => {
  return (
    <div className={Styles.wrapper}>
      <MenuButtonHome />
    </div>
  );
};
