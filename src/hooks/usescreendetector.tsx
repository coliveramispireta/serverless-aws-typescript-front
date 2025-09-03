"use client";
import { useEffect, useState } from "react";
import amthemevars from "../styles/amthemevars.module.scss";

export const useScreenDetector = () => {
  const [width, setWidth] = useState(0);
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  if (typeof window !== "undefined") {
    if (width === 0) {
      setWidth(window.innerWidth);
    }

    const isMobile = width <= +amthemevars.Tablet;
    const isTablet = width <= +amthemevars.Desktop && width > +amthemevars.Tablet;
    const isDesktop = width <= +amthemevars.DesktopLarge && width > +amthemevars.Desktop;
    const isDesktopLarge = width > +amthemevars.DesktopLarge;

    return { isMobile, isTablet, isDesktop, isDesktopLarge };
  }
  return { isMobile: false, isTablet: false, isDesktop: true, isDesktopLarge: false };
};
