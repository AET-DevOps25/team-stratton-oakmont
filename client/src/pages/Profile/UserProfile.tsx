import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import {
  AccountCircle,
  ExitToApp,
  ArrowBack,
  CheckCircle,
  Person,
  Email,
  Key,
  CalendarToday,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const UserProfile: React.FC = () => {
  const { userEmail, userId, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Create floating elements for background animation
  const floatingElements = Array.from({ length: 8 }, (_, i) => i);

  if (!isLoggedIn || !userEmail) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2a2a2a 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background animation */}
        {floatingElements.map((i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              backgroundColor: "rgba(100, 108, 255, 0.3)",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px)", opacity: 0.3 },
                "50%": { transform: `translateY(${Math.random() * 20 - 10}px)`, opacity: 0.8 },
              },
            }}
          />
        ))}
        
        <Container component="main" maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              background: "rgba(42, 42, 42, 0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(100, 108, 255, 0.2)",
              borderRadius: 4,
              color: "white",
            }}
          >
            <AccountCircle sx={{ fontSize: 80, color: "#646cff", mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Access Required
            </Typography>
            <Typography variant="body1" sx={{ color: "#aaa", mb: 4 }}>
              Please log in to view your profile.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "50px",
                background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                "&:hover": { transform: "translateY(-2px)" },
                transition: "all 0.3s ease",
              }}
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2a2a2a 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
        py: 4,
      }}
    >
      {/* Background animation */}
      {floatingElements.map((i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: "rgba(100, 108, 255, 0.3)",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)", opacity: 0.3 },
              "50%": { transform: `translateY(${Math.random() * 20 - 10}px)`, opacity: 0.8 },
            },
          }}
        />
      ))}

      <Container component="main" maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "#646cff",
                backgroundColor: "rgba(100, 108, 255, 0.1)",
              },
            }}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="error"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            sx={{
              background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
              "&:hover": { transform: "translateY(-2px)" },
              transition: "all 0.3s ease",
            }}
          >
            Logout
          </Button>
        </Box>

        {/* Main Profile Card */}
        <Paper
          sx={{
            p: 6,
            background: "rgba(42, 42, 42, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(100, 108, 255, 0.2)",
            borderRadius: 4,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(100, 108, 255, 0.05) 0%, transparent 100%)",
              zIndex: -1,
            },
          }}
        >
          {/* Profile Header */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 3,
                background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                fontSize: "3rem",
                boxShadow: "0 8px 32px rgba(100, 108, 255, 0.4)",
              }}
            >
              {userEmail?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: "#fff" }}>
              {userEmail?.split('@')[0] || 'User'}
            </Typography>
            
            <Chip
              icon={<CheckCircle />}
              label="Authenticated"
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                color: "#4caf50",
                border: "1px solid rgba(76, 175, 80, 0.3)",
                fontWeight: 500,
              }}
            />
          </Box>

          <Divider sx={{ mb: 6, borderColor: "rgba(100, 108, 255, 0.2)" }} />

          {/* Profile Information */}
          <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Typography variant="h6" sx={{ mb: 4, textAlign: "center", color: "#646cff" }}>
              Account Information
            </Typography>

            {/* Email */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 4, p: 3, backgroundColor: "rgba(255, 255, 255, 0.02)", borderRadius: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "rgba(100, 108, 255, 0.1)",
                  mr: 3,
                }}
              >
                <Email sx={{ color: "#646cff" }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#aaa", mb: 0.5}}>
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: "#fff" }}>
                  {userEmail}
                </Typography>
              </Box>
            </Box>

            {/* User ID */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 4, p: 3, backgroundColor: "rgba(255, 255, 255, 0.02)", borderRadius: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "rgba(100, 108, 255, 0.1)",
                  mr: 3,
                }}
              >
                <Person sx={{ color: "#646cff" }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#aaa", mb: 0.5 }}>
                  User ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: "monospace", color: "#fff" }}>
                  {userId}
                </Typography>
              </Box>
            </Box>

            {/* Session Status */}
            <Box sx={{ display: "flex", alignItems: "center", p: 3, backgroundColor: "rgba(255, 255, 255, 0.02)", borderRadius: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                  mr: 3,
                }}
              >
                <Key sx={{ color: "#4caf50" }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#aaa", mb: 0.5 }}>
                  Session Status
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: "#4caf50" }}>
                  Active & Secure
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfile;