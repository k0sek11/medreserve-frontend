import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi, type CompleteProfileRequest } from "../api/auth";
import { useAuthUser, authUserQueryKey } from "./useAuthUser";
import type { ProfileType } from "../types/profile";

const genderOptions = [
    { value: "Kobieta", label: "Kobieta" },
    { value: "Mezczyzna", label: "Mężczyzna" },
    { value: "Inne", label: "Inne" },
];

export const useProfileCompletion = () => {
    const { data: user, isLoading } = useAuthUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [profileType, setProfileType] = useState<ProfileType>(null);
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState(genderOptions[0].value);
    const [licenseNumber, setLicenseNumber] = useState("");

    const completionMutation = useMutation({
        mutationFn: (payload: CompleteProfileRequest) => authApi.completeProfile(payload),
        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
            navigate(variables.profileType === "Doctor" ? "/powiadomienia" : "/", {
                replace: true,
            });
        },
    });

    const canSubmit =
        Boolean(profileType) &&
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        phoneNumber.trim().length > 0 &&
        birthDate.trim().length > 0 &&
        gender.trim().length > 0 &&
        (profileType !== "Doctor" || licenseNumber.trim().length > 0);

    const submit = () => {
        if (!profileType) return;
        completionMutation.mutate({
            profileType,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: phoneNumber.trim(),
            birthDate,
            gender,
            licenseNumber: profileType === "Doctor" ? licenseNumber.trim() : null,
        });
    };

    return {
        user,
        isLoading,
        profileType,
        setProfileType,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        phoneNumber,
        setPhoneNumber,
        birthDate,
        setBirthDate,
        gender,
        setGender,
        licenseNumber,
        setLicenseNumber,
        canSubmit,
        completionMutation,
        submit,
        genderOptions,
    };
};
