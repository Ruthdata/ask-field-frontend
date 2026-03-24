import { useState } from 'react';
import OtpInput from 'react-otp-input';

interface OTPFormProps {
  value: string;
  handleChange: (otp: string) => void;
  numInputs: number;
}

export default function OTPForm({ value, handleChange, numInputs }: OTPFormProps) {
  return (
    <OtpInput
      value={value}
      shouldAutoFocus
      onChange={handleChange}
      numInputs={numInputs}
      // Note: renderSeparator is the standard prop name for the separator in newer versions
      renderSeparator={<span className='mx-1'></span>}
      inputStyle="otp-input"
      inputType="text"
      renderInput={(inputProps) => (
        <input
          {...inputProps}
          style={{
            width: "38px",
            height: "40px",
            fontSize: "20px",
            margin: "0 2px",
            textAlign: "center",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          className="rounded outline-none transition-all duration-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20"
        />
      )}
    />
  );
}
