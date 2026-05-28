import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { useNavigate } from "react-router-dom";

export type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const initialValues: RegisterFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
};

const useRegisterForm = () => {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormValues, "confirmPassword">) => {
      return await authApi.register(data);
    },
    onError: (err: any) => {
      console.error("Błąd podczas rejestracji:", err);
      setError(
        err.response?.data?.message || "Wystąpił błąd podczas rejestracji",
      );
    },
    onSuccess: () => {
      navigate("/login", { replace: true });
    }
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
