"use client";
import React, { use, useEffect, useState } from "react";
import Loading from "../loading";
import Navbar from "@/components/navbar/navbar";
import useIndex from "@/hooks/useindex";
import Footer from "@/components/footer/footer";
import LoginPage, { LoginFormModel } from "@/components/loginpage/loginpage";
import FooterBets from "@/components/footerbets/footerbets";
import NavbarBets from "@/components/navbarbets/navbarbets";

const Page = () => {
  const { apiCallState } = useIndex();

  return (
    <>
      <div className="pageContainer">
        {apiCallState.value && <Loading />}
        <NavbarBets />
        <main className="main">
          <LoginPage />
        </main>
        <FooterBets />
      </div>
    </>
  );
};

export default Page;
