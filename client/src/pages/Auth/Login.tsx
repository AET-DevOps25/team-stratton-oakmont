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
} from "@mui/material";
import { LoginOutlined } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/auth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <LoginOutlined sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />

        <Typography component="h1" variant="h4" gutterBottom>
          Log In
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Welcome back! Please log in to your account.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? "Logging In..." : "Log In"}
          </Button>

          {message && (
            <Alert severity={isError ? "error" : "success"} sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <MuiLink
              component="button"
              variant="body2"
              onClick={() => navigate("/signup")}
              sx={{ textDecoration: "none" }}
            >
              Don't have an account? Sign Up
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
