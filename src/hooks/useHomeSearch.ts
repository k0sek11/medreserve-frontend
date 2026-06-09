import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { doctorsApi } from "../api/doctors";

export const useHomeSearch = () => {
    const navigate = useNavigate();
    const [specialization, setSpecialization] = useState("");
    const [city, setCity] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");

    const { data: cities = [] } = useQuery({
        queryKey: ["home-cities"],
        queryFn: () => doctorsApi.getCities(),
    });

    const { data: specializations = [] } = useQuery({
        queryKey: ["home-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
    });

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (specialization) params.set("specializationId", specialization);
        if (city) params.set("cityId", city);
        if (appointmentDate) params.set("date", appointmentDate);
        navigate(`/lekarze?${params.toString()}`);
    };

    return {
        specialization,
        setSpecialization,
        city,
        setCity,
        appointmentDate,
        setAppointmentDate,
        cities,
        specializations,
        handleSearch,
    };
};
