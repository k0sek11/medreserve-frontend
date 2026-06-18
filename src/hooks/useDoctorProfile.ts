import { useQuery } from "@tanstack/react-query";
import { doctorsApi } from "../api/doctors";
import { useAuthUser } from "./useAuthUser";

export const useDoctorProfile = () => {
    const { data: user } = useAuthUser();
    const isDoctor = Boolean(user?.doctorProfileId);

    const profileQuery = useQuery({
        queryKey: ["doctor-my-profile"],
        queryFn: () => doctorsApi.getMyProfile(),
        enabled: isDoctor,
    });

    return { isDoctor, profileQuery };
};
