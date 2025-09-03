"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import useIndex from "@/hooks/useindex";
import Footer from "@/components/footer/footer";
import Loading from "@/app/loading";
import RegisterPage from "@/components/registerpage/registerpage";

const Page = () => {
  const { apiCallState } = useIndex();

  return (
    <>
      <div className="pageContainer">
        {apiCallState.value && <Loading />}
        <Navbar />
        <main className="main">
          <RegisterPage />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Page;
