import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Link as MuiLink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { PersonAddOutlined, CheckCircleOutline } from '@mui/icons-material';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8083/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Registration successful for ${data.email || email}! Redirecting to login...`);
        setIsError(false);
        setTimeout(() => navigate('/login'), 500);
      } else {
        setMessage(`Registration failed: ${data.message || response.statusText}`);
        setIsError(true);
      }
    } catch (error) {
      setMessage(`Registration request failed: ${error instanceof Error ? error.message : String(error)}`);
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
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <PersonAddOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        
        <Typography component="h1" variant="h4" gutterBottom>
          Sign Up
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Join TUM Study Planner to manage your academic journey
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
            helperText="Use your TUM email address"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />

          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Password Requirements:
            </Typography>
            <List dense>
              <ListItem sx={{ py: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircleOutline fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="At least 1 characters long" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>

          {message && (
            <Alert 
              severity={isError ? 'error' : 'success'} 
              sx={{ mt: 2 }}
            >
              {message}
            </Alert>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Typography>
            
            <MuiLink 
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ mt: 1, textDecoration: 'none' }}
            >
              Already have an account? Log In
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;