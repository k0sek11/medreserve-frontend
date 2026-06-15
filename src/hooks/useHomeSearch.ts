import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { doctorsApi } from "../api/doctors";

export const useHomeSearch = () => {
    const navigate = useNavigate();
    const [specialization, setSpecialization] = useState("");
    const [location, setLocation] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");

    const { data: specializations = [] } = useQuery({
        queryKey: ["home-specializations"],
        queryFn: () => doctorsApi.getSpecializations(),
    });

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (specialization) params.set("specializationId", specialization);
        if (location) params.set("location", location);
        if (appointmentDate) params.set("date", appointmentDate);
        navigate(`/lekarze?${params.toString()}`);
    };

    return {
        specialization,
        setSpecialization,
        location,
        setLocation,
        appointmentDate,
        setAppointmentDate,
        specializations,
        handleSearch,
    };
};
