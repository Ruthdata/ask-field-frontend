import React from "react";

export default function PartnerHome() {
  return (
    <div>
      <div className="flex justify-center items-center gap-8 mb-3 mt-8 border border-[#EEEEEE] p-6 rounded-3xl w-max">
        <img
          src="/images/home/university-of-florida.svg"
          alt="University of Florida"
          className="cursor-pointer w-[156px] h-[45px]"
        />

        <img
          src="/images/home/careton-university.svg"
          alt="Carleton University"
          className="cursor-pointer w-[125px] h-[45px]"
        />
      </div>

      <h2>Partner with askField today</h2>
    </div>
  );
}