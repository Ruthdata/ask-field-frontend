import { createContext, useContext, useState, ReactNode } from "react";

export interface ResearcherFormData {
  email: string;
  country: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  organizationName: string;
  organizationType: string;
  password: string;
  confirmPassword: string;
}

interface FormContextType {
  formData: ResearcherFormData;
  updateFormData: (data: Partial<ResearcherFormData>) => void;
  resetForm: () => void;
  formStep: number;
  setFormStep: (step: number) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialFormData: ResearcherFormData = {
  email: "",
  country: "",
  firstName: "",
  lastName: "",
  jobTitle: "",
  organizationName: "",
  organizationType: "",
  password: "",
  confirmPassword: "",
};

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ResearcherFormData>(initialFormData);
  const [formStep, setFormStep] = useState(1);

  const updateFormData = (data: Partial<ResearcherFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => setFormData(initialFormData);

  return (
    <FormContext.Provider
      value={{ formData, updateFormData, resetForm, formStep, setFormStep }}
    >
      {children}
    </FormContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within FormProvider");
  }
  return context;
}
