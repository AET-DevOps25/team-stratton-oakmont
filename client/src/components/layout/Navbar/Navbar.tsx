import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Person,
  School,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { theme } from '../../../theme/Theme'
import Sidebar from '../Sidebar/Sidebar';

const Navbar: React.FC = () => {
  const { isLoggedIn, userEmail, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const sidebarWidth = isLoggedIn && sidebarOpen ? '240px' : '0px';
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [isLoggedIn, sidebarOpen]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: '#333',
          boxShadow: 'none',
          borderBottom: '1px solid #444',
          zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure navbar is above sidebar
        }}
      >
        <Toolbar>
          {/* Add menu button - only show when logged in */}
          {isLoggedIn && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ mr: 2, color: 'white' }} />
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'white',
                fontWeight: theme.typography.h6.fontWeight,
                fontFamily: theme.typography.fontFamily,
                '&:hover': {
                  opacity: 0.8
                },
              }}
              onClick={handleLogoClick}
            >
              TUM Study Planner
            </Typography>
          </Box>

          {isLoggedIn ? (
            <Box>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ color: 'white' }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: '#646cff',
                    fontSize: '14px'
                  }}
                >
                  {userEmail ? userEmail.charAt(0).toUpperCase() : <AccountCircle />}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    minWidth: '160px',
                    mt: 1
                  }
                }}
              >
                <MenuItem 
                  onClick={handleProfile}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <Person sx={{ mr: 1, fontSize: '20px' }} />
                  View Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  <ExitToApp sx={{ mr: 1, fontSize: '20px' }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Log In
              </Button>
              <Button 
                variant="contained"
                onClick={() => navigate('/signup')}
                sx={{
                  backgroundColor: '#646cff',
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#535bf2'
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {isLoggedIn && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}
    </>
  );
};

export default Navbar;