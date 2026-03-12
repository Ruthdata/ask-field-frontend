"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FormData {
  email: string;
  country: string;
  companyName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  organizationName: string;
  organizationType: string;
  password?: string;
  confirmPassword?: string;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialFormData: FormData = {
  email: "",
  country: "",
  companyName: "",
  firstName: "",
  lastName: "",
  jobTitle: "",
  organizationName: "",
  organizationType: "",
  password: undefined,
  confirmPassword: undefined,
};

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, resetForm }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within FormProvider");
  }
  return context;
}
