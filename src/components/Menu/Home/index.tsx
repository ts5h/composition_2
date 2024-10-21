import React from "react";
import { MenuButtonHome } from "../Button/Home";
import Styles from "../../../scss/MenuHome.module.scss";

export const MenuHome = () => {
  return (
    <div className={Styles.wrapper}>
      <MenuButtonHome />
    </div>
  );
};
