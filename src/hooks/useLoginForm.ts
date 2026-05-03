import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";

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
  const queryClient = useQueryClient();
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (data: Omit<LoginFormValues, "rememberMe">) => {
      return await authApi.login(data);
    },
    onSuccess: (data) => {
      // Zmuszamy globalny stan do ponownego pobrania `me` - zaraz zaktualizuje to całe UI
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      console.log("Pomyślnie zalogowano!", data);
    },
    onError: (err: any) => {
      console.error("Błąd logowania:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Nieprawidłowy email lub hasło.",
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

  const handleRememberMeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({
      ...prev,
      rememberMe: event.target.checked,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
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
    error,
    isLoading: loginMutation.isPending,
    isSuccess: loginMutation.isSuccess,
    handleInputChange,
    handleRememberMeChange,
    handleSubmit,
    loginWithGoogle,
    loginWithFacebook,
  };
};

export default useLoginForm;
