import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { Dayjs } from "dayjs";
import { doctorsApi } from "../api/doctors";
import { homeSearchSchema, type HomeSearchFormData } from "../lib/validations";

export const useHomeSearch = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<HomeSearchFormData>({
        resolver: zodResolver(homeSearchSchema),
        defaultValues: {
            specialization: "",
            location: "",
            appointmentDate: "",
        },
    });

    const { data: specializations = [] } = useQuery({
        queryKey: ["home-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
    });

    const onSubmit = (data: HomeSearchFormData) => {
        const params = new URLSearchParams();
        if (data.specialization) params.set("specializationId", data.specialization);
        if (data.location) params.set("location", data.location);
        if (data.appointmentDate) params.set("date", data.appointmentDate);
        navigate(`/lekarze?${params.toString()}`);
    };

    const setAppointmentDate = (value: Dayjs | null) => {
        setValue("appointmentDate", value ? value.format("YYYY-MM-DD") : "", {
            shouldValidate: true,
        });
    };

    return {
        register,
        handleSubmit: handleSubmit(onSubmit),
        control,
        errors,
        specializations,
        setAppointmentDate,
    };
};
