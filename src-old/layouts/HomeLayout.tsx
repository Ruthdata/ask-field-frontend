import FooterHome from "@components/footer/FooterHome";
import NavbarHome from "@components/navbar/NavbarHome";
import React from "react";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  return (
    <div>
      <NavbarHome />
      <Outlet />
      <FooterHome />
    </div>
  );
};

export default HomeLayout;
