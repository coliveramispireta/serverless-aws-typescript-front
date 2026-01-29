"use client";
import React, { use, useEffect, useState } from "react";
import Loading from "../loading";
import Navbar from "@/components/navbar/navbar";
import useIndex from "@/hooks/useindex";
import Footer from "@/components/footer/footer";
import DashboardTicket from "@/components/dashboardticket/dashboardticket";
import { Fitness } from "@/components/fitness/fitness";
import NavbarBets from "@/components/navbarbets/navbarbets";
import FooterBets from "@/components/footerbets/footerbets";

const Page = () => {
  const { apiCallState } = useIndex();

  return (
    <>
      <div className="pageContainer">
        {apiCallState.value && <Loading />}
        <NavbarBets />
        <main className="main">
          <Fitness />
        </main>
        <FooterBets />
      </div>
    </>
  );
};

export default Page;
