import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/signup');
    }
  };

  return (
    <Container 
      maxWidth="xl"
      sx={{ 
        minHeight: 'calc(100vh - 64px)',
        py: 8,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {/* Hero Section */}
      <Box 
        sx={{ 
          textAlign: 'center',
          mb: 8
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: '2.5rem', md: '4rem' },
            color: '#333'
          }}
        >
          TUM Study Planner
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4,
            color: '#555',
            fontSize: { xs: '1.1rem', md: '1.5rem' },
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Navigate your TUM studies effortlessly with an AI assistant that helps you choose courses, track requirements, and validate your academic plan.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleGetStarted}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: '8px',
            backgroundColor: '#646cff',
            color: 'white',
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 4px 14px rgba(100, 108, 255, 0.25)',
            '&:hover': {
              backgroundColor: '#535bf2',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(100, 108, 255, 0.35)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {isLoggedIn ? 'Go to Profile' : 'Get Started'}
        </Button>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              height: '100%',
              background: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #ddd',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#333'
                }}
              >
                Study Plan
              </Typography>
              <Box 
                sx={{ 
                  height: '200px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  border: '1px solid #ddd'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#555',
                    fontStyle: 'italic'
                  }}
                >
                  &lt;TBD: Preview Study Plan&gt;
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              height: '100%',
              background: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #ddd',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#333'
                }}
              >
                Course Selection
              </Typography>
              <Box 
                sx={{ 
                  height: '200px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  border: '1px solid #ddd'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#555',
                    fontStyle: 'italic'
                  }}
                >
                  &lt;TBD: Preview Course Selection&gt;
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              height: '100%',
              background: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #ddd',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: '#333'
                }}
              >
                AI Assistant
              </Typography>
              <Box 
                sx={{ 
                  height: '200px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  border: '1px solid #ddd'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#555',
                    fontStyle: 'italic'
                  }}
                >
                  &lt;TBD: Preview AI Assistant&gt;
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LandingPage;