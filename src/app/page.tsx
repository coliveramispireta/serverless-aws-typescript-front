"use client";
import Loading from "./loading";
import React from "react";
import useIndex from "../hooks/useindex";
import Navbar from "@/components/navbar/navbar";
import HeroSection from "@/components/herosection/herosection";

import AboutMeSection from "@/components/aboutmesection/aboutmesection";
import Footer from "@/components/footer/footer";

import ContactForm from "@/components/contactform/contactform";
import RatingClient from "@/components/ratingclient/ratingclient";
import { Fitness } from "@/components/fitness/fitness";
import NavbarBets from "@/components/navbarbets/navbarbets";
import HeroSectionBets from "@/components/herosectionbets/herosectionbets";
import FooterBets from "@/components/footerbets/footerbets";

export default function Home() {
  const { apiCallState } = useIndex();
  //console.log("APP_ENV: ", process.env.APP_ENV)
  return (
    <>
      <div className="pageContainer">
        {apiCallState.value ? <Loading /> : null}
        {/* <Navbar /> */}
        <NavbarBets />
        <main className="mainHome">
          <HeroSectionBets />
          {/* 
          <HeroSection />
          <ContactForm id="contacto" />
          <AboutMeSection /> 
          */}
          
        </main>
        {/* <Footer /> */}
        <FooterBets />
      </div>
    </>
  );
}
