"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "@/components/navbar/navbar";
import useIndex from "@/hooks/useindex";
import Footer from "@/components/footer/footer";
import Loading from "@/app/loading";
import ProfilePage from "@/components/profilepage.profilepage";

const Page = () => {
  const { apiCallState } = useIndex();

  return (
    <>
      <div className="pageContainer">
        {apiCallState.value && <Loading />}
        <Navbar />
        <main className="main">
          <ProfilePage />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Page;
