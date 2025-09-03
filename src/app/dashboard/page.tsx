"use client";
import React, { use, useEffect, useState } from "react";
import Loading from "../loading";
import Navbar from "@/components/navbar/navbar";
import useIndex from "@/hooks/useindex";
import Footer from "@/components/footer/footer";
import DashboardTicket from "@/components/dashboardticket/dashboardticket";

const Page = () => {
  const { apiCallState } = useIndex();

  return (
    <>
      <div className="pageContainer">
        {apiCallState.value && <Loading />}
        <Navbar />
        <main className="main">
          <DashboardTicket />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Page;
