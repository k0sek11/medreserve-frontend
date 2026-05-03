import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth";

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
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormValues, "confirmPassword">) => {
      return await authApi.register(data);
    },
    onSuccess: () => {
      // TODO: Przekierowanie do logowania lub automatyczne logowanie po udanej rejestracji
      console.log("Pomyślnie zarejestrowano!");
    },
    onError: (err: any) => {
      console.error("Błąd podczas rejestracji:", err);
      setError(
        err.response?.data?.message || "Wystąpił błąd podczas rejestracji",
      );
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (values.password !== values.confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    const { confirmPassword, ...registerPayload } = values;
    registerMutation.mutate(registerPayload);
  };

  return {
    values,
    error,
    isLoading: registerMutation.isPending,
    isSuccess: registerMutation.isSuccess,
    handleInputChange,
    handleSubmit,
  };
};

export default useRegisterForm;
