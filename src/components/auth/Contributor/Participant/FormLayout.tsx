import React from "react";

type FormLayoutProps = {
  children: React.ReactNode;
};

const FormLayout = ({ children }: FormLayoutProps) => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 mb-30">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right Side - Fixed Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden mt-30">
        <img
          src="/images/shared/company-image.svg"
          alt="Participant"
          className="object-contain w-[730px] h-[300px]"
        />
      </div>
    </div>
  );
};

export default FormLayout;