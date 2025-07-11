import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import Navbar from "./components/layout/Navbar/Navbar";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import LandingPage from "./pages/LandingPage/LandingPage";
import UserProfile from "./pages/Profile/UserProfile";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { theme } from "./theme/Theme";
import StudyPlanDetailPage from "./pages/StudyPlans/StudyPlanDetailPage";
import { StudyPlansProvider } from "./contexts/StudyPlansContext";
import CurriculumPage from "./pages/Curriculum/CurriculumPage";
import CoursesPage from "./pages/Courses/CoursesPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <StudyPlansProvider>
          <Router>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                backgroundColor: theme.palette.background.default,
              }}
            >
              <Navbar />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  pt: 8, // Account for fixed navbar
                  backgroundColor: theme.palette.background.default,
                  // Add this CSS variable that will be controlled by the navbar
                  marginLeft: "var(--sidebar-width, 0px)",
                  transition: "margin-left 0.3s ease",
                }}
              >
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />

                  <Route
                    path="/login"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <Login />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/signup"
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <SignUp />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/curriculum"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <CurriculumPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/courses"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <CoursesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/study-plans/:id"
                    element={
                      <ProtectedRoute requireAuth={true}>
                        <StudyPlanDetailPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Box>
            </Box>
          </Router>
        </StudyPlansProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
