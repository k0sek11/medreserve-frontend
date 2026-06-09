import { useQuery } from "@tanstack/react-query";
import { doctorsApi } from "../api/doctors";
import { useAuth } from "../context/AuthContext";

export const useDoctorProfile = () => {
    const { user } = useAuth();
    const isDoctor = Boolean(user?.doctorProfileId);

    const profileQuery = useQuery({
        queryKey: ["doctor-my-profile"],
        queryFn: () => doctorsApi.getMyProfile(),
        enabled: isDoctor,
    });

    return { isDoctor, profileQuery };
};
