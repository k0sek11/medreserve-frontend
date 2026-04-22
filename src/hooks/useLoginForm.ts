import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const initialValues: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: false,
};

const useLoginForm = () => {
  const [values, setValues] = useState<LoginFormValues>(initialValues);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRememberMeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({
      ...prev,
      rememberMe: event.target.checked,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder for future API auth call.
    console.log("Login submit payload:", values);
  };

  const loginWithGoogle = () => {
    // Placeholder for future OAuth Google flow.
    console.log("Login with Google");
  };

  const loginWithFacebook = () => {
    // Placeholder for future OAuth Facebook flow.
    console.log("Login with Facebook");
  };

  return {
    values,
    handleInputChange,
    handleRememberMeChange,
    handleSubmit,
    loginWithGoogle,
    loginWithFacebook,
  };
};

export default useLoginForm;
