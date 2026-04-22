import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DoctorDetailsPage from "./pages/DoctorDetailsPage";
import DoctorsSearchPage from "./pages/DoctorsSearchPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="lekarze" element={<DoctorsSearchPage />} />
          <Route path="lekarze/:doctorSlug" element={<DoctorDetailsPage />} />
          <Route
            path="poradnie"
            element={<PlaceholderPage title="Poradnie" />}
          />
          <Route path="o-nas" element={<PlaceholderPage title="O nas" />} />
          <Route path="kontakt" element={<PlaceholderPage title="Kontakt" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
