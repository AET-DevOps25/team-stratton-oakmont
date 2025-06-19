import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  ArrowBack,
  CheckCircle,
  Cancel,
  DeveloperMode
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { userEmail, userId, isLoggedIn, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!isLoggedIn || !userEmail) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <AccountCircle sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            User Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please log in to view your profile.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{ mt: 3 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const userRows = [
    { property: 'User ID', value: userId || 'Not available' },
    { property: 'Email Address', value: userEmail || 'Not available' },
    { property: 'Session Info', value: 'Active session since login' }
  ];

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AccountCircle sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography component="h1" variant="h4">
            User Profile
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome to your profile page! Here you can view your account information.
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userRows.map((row) => (
                <TableRow key={row.property}>
                  <TableCell component="th" scope="row">
                    {row.property}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {row.value}
                  </TableCell>
                </TableRow>
              ))}
              
              <TableRow>
                <TableCell component="th" scope="row">
                  Authentication Status
                </TableCell>
                <TableCell>
                  <Chip
                    icon={isLoggedIn ? <CheckCircle /> : <Cancel />}
                    label={isLoggedIn ? 'Authenticated' : 'Not Authenticated'}
                    color={isLoggedIn ? 'success' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell component="th" scope="row">
                  JWT Token
                </TableCell>
                <TableCell sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  backgroundColor: 'grey.50'
                }}>
                  {token ? `${token.substring(0, 50)}...` : 'No token available'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
          >
            Logout
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Alert severity="info" icon={<DeveloperMode />}>
          <AlertTitle>Developer Information</AlertTitle>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Data Source:</strong> Retrieved from AuthContext
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Authentication Method:</strong> JWT Token-based
          </Typography>
          <Typography variant="body2">
            <strong>Context Hook:</strong> useAuth() from AuthContext
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default UserProfile;