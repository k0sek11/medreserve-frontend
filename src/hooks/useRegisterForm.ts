import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const useRegisterForm = () => {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder for future register API call.
    console.log("Register submit payload:", values);
  };

  return {
    values,
    handleInputChange,
    handleSubmit,
  };
};

export default useRegisterForm;
