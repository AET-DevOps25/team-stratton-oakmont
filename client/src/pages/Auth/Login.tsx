import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Link as MuiLink,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/auth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    try {
      const data = await authApi.login({ email, password });
      setMessage(`Login successful! Welcome ${email}. Redirecting to home...`);
      setIsError(false);
      login(data.token, data.userId, data.email);
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Login failed: ${error.message}`);
      } else {
        setMessage("Login failed: Unknown error");
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Create floating elements for background animation
  const floatingElements = Array.from({ length: 15 }, (_, i) => i);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2a2a2a 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        {/* Grid Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(100, 108, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(100, 108, 255, 0.1) 0%, transparent 50%),
              linear-gradient(90deg, rgba(100, 108, 255, 0.03) 1px, transparent 1px),
              linear-gradient(rgba(100, 108, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 100% 100%, 50px 50px, 50px 50px",
          }}
        />

        {/* Floating Particles */}
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
                "0%, 100%": {
                  transform: "translateY(0px) rotate(0deg)",
                  opacity: 0.3,
                },
                "50%": {
                  transform: `translateY(${
                    Math.random() * 20 - 10
                  }px) rotate(180deg)`,
                  opacity: 0.8,
                },
              },
            }}
          />
        ))}
      </Box>

      <Container
        component="main"
        maxWidth="sm"
        sx={{ position: "relative", zIndex: 1 }}
      >
        {/* Back Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              textTransform: "none",
              "&:hover": {
                borderColor: "#646cff",
                backgroundColor: "rgba(100, 108, 255, 0.1)",
                color: "white",
              },
              transition: "all 0.3s ease",
            }}
          >
            Back to Home
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(42, 42, 42, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(100, 108, 255, 0.2)",
            borderRadius: 4,
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(100, 108, 255, 0.05) 0%, transparent 100%)",
              zIndex: -1,
            },
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              background:
                "linear-gradient(135deg, #ffffff 0%, #646cff 50%, #ffffff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 200%",
              animation: "textShimmer 4s ease-in-out infinite",
              "@keyframes textShimmer": {
                "0%, 100%": {
                  backgroundPosition: "0% 50%",
                },
                "50%": {
                  backgroundPosition: "100% 50%",
                },
              },
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: "#aaa",
              textAlign: "center",
              fontWeight: 300,
            }}
          >
            Log in to continue your academic journey
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              placeholder="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#646cff" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 3,
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100, 108, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#646cff",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                  fontSize: "1.1rem",
                },
                "& .MuiInputLabel-root": {
                  color: "#aaa",
                  "&.Mui-focused": {
                    color: "#646cff",
                  },
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#646cff" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: "#aaa" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 3,
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100, 108, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#646cff",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                  fontSize: "1.1rem",
                },
                "& .MuiInputLabel-root": {
                  color: "#aaa",
                  "&.Mui-focused": {
                    color: "#646cff",
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "50px",
                background: "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                color: "white",
                textTransform: "none",
                boxShadow: "0 8px 32px rgba(100, 108, 255, 0.4)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                  transition: "left 0.6s",
                },
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 40px rgba(100, 108, 255, 0.6)",
                  "&::before": {
                    left: "100%",
                  },
                },
                "&:disabled": {
                  background: "rgba(100, 108, 255, 0.3)",
                  transform: "none",
                  "&::before": {
                    display: "none",
                  },
                },
                transition: "all 0.3s ease",
                mb: 3,
              }}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </Button>

            {message && (
              <Alert
                severity={isError ? "error" : "success"}
                sx={{
                  mb: 3,
                  backgroundColor: isError
                    ? "rgba(244, 67, 54, 0.1)"
                    : "rgba(76, 175, 80, 0.1)",
                  color: isError ? "#ff6b6b" : "#4caf50",
                  border: `1px solid ${
                    isError
                      ? "rgba(244, 67, 54, 0.2)"
                      : "rgba(76, 175, 80, 0.2)"
                  }`,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    color: isError ? "#ff6b6b" : "#4caf50",
                  },
                }}
              >
                {message}
              </Alert>
            )}

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#aaa", mb: 2 }}>
                Don't have an account yet?
              </Typography>
              <MuiLink
                component="button"
                variant="body1"
                onClick={() => navigate("/signup")}
                sx={{
                  textDecoration: "none",
                  color: "#646cff",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": {
                    color: "#535bf2",
                    textDecoration: "underline",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Create your account here
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
