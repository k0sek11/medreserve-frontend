import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuthUser } from "./useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { authUserQueryKey } from "./useAuthUser";
import { useThemeMode } from "../context/ThemeContext";

export const useMainLayout = () => {
    const { t, i18n } = useTranslation();
    const { data: user, isLoading } = useAuthUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { mode, toggleTheme } = useThemeMode();

    const isDoctor = Boolean(user?.roles.includes("Doctor"));

    const navLinks = [
        { to: "/", labelKey: "nav.home" },
        { to: "/lekarze", labelKey: "nav.doctors" },
        { to: "/wizyty", labelKey: "nav.myAppointments" },
        { to: "/poradnie", labelKey: "nav.clinics" },
    ];

    const visibleNavLinks = useMemo(() => {
        return navLinks.filter((item) => {
            if (!isDoctor) return true;
            return !["/", "/lekarze", "/wizyty"].includes(item.to);
        });
    }, [isDoctor]);

    const logoutMutation = useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: async () => {
            queryClient.setQueryData(authUserQueryKey, null);
            await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
            navigate("/login", { replace: true });
        },
    });

    return {
        t,
        i18n,
        user,
        isLoading,
        isDoctor,
        mode,
        toggleTheme,
        visibleNavLinks,
        logoutMutation,
    };
};
