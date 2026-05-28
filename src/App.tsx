import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import RequireAuth from "./components/auth/RequireAuth";
import RequireActiveAccount from "./components/auth/RequireActiveAccount";
import DoctorDetailsPage from "./pages/DoctorDetailsPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import DoctorsSearchPage from "./pages/DoctorsSearchPage";
import ClinicsPage from "./pages/ClinicsPage";
import ClinicDetailsPage from "./pages/ClinicDetailsPage";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyClinicsPage from "./pages/MyClinicsPage";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileCompletionPage from "./pages/ProfileCompletionPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import { CreateClinicPage } from "./pages/CreateClinicPage";
function App() {
    return (
        <GoogleOAuthProvider clientId="140484954108-teas0lbcuvqb9a83upfejs6qad1t51e3.apps.googleusercontent.com">
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/uzupelnij-profil"
                    element={
                        <RequireAuth>
                            <ProfileCompletionPage />
                        </RequireAuth>
                    }
                />

                <Route
                    path="/"
                    element={
                        <RequireActiveAccount>
                            <MainLayout />
                        </RequireActiveAccount>
                    }
                >
                    <Route index element={<HomePage />} />
                    <Route path="lekarze" element={<DoctorsSearchPage />} />
                    <Route path="lekarze/:doctorId" element={<DoctorDetailsPage />} />
                    <Route path="moj-profil" element={<DoctorProfilePage />} />
                    <Route path="wizyty" element={<MyAppointmentsPage />} />
                    <Route path="moje-wizyty" element={<MyAppointmentsPage />} />
                    <Route path="wizyty/potwierdzenie/:appointmentId" element={<AppointmentConfirmationPage />} />
                    <Route path="poradnie" element={<ClinicsPage />} />
                    <Route path="poradnie/:clinicId" element={<ClinicDetailsPage />} />
                    <Route path="poradnie/nowa" element={<CreateClinicPage />} />
                    <Route path="moje-przychodnie" element={<MyClinicsPage />} />
                    <Route path="powiadomienia" element={<NotificationsPage />} />
                    <Route path="o-nas" element={<PlaceholderPage title="O nas" />} />
                    <Route path="kontakt" element={<PlaceholderPage title="Kontakt" />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;
