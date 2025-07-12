import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  AccountCircle,
  ExitToApp,
  Person,
  ViewSidebar,
  Menu as MenuIcon,
  SmartToy,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { theme } from "../../../theme/Theme";
import Sidebar from "../Sidebar/Sidebar";
import AiChatSidebar from "../AiChatSidebar/AiChatSidebar";
import sidebarIcon from "../../../assets/icons/sidebar.svg";

const Navbar: React.FC = () => {
  const { isLoggedIn, userEmail, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sidebarWidth = isLoggedIn && sidebarOpen ? "260px" : "0px";
    const aiChatWidth = isLoggedIn && aiChatOpen ? "380px" : "0px";
    document.documentElement.style.setProperty("--sidebar-width", sidebarWidth);
    document.documentElement.style.setProperty("--ai-chat-width", aiChatWidth);
  }, [isLoggedIn, sidebarOpen, aiChatOpen]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
    handleClose();
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAiChatToggle = () => {
    setAiChatOpen(!aiChatOpen);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "rgba(15, 15, 15, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(100, 108, 255, 0.1)",
          zIndex: (theme) => theme.zIndex.drawer + 1,

          transition: "margin-left 0.3s ease",
          marginLeft: isLoggedIn && sidebarOpen ? "260px" : "0px",
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
              disableRipple
              sx={{
                mr: 2,
                color: "rgba(255, 255, 255, 0.8)",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              <img
                src={sidebarIcon}
                alt="sidebar"
                style={{
                  width: "24px",
                  height: "24px",
                  filter: "brightness(0) invert(1)", // Makes it white
                }}
              />
            </IconButton>
          )}

          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                cursor: "pointer",
                textDecoration: "none",
                color: "white",
                fontWeight: 700,
                fontFamily: theme.typography.fontFamily,
                background:
                  "linear-gradient(135deg, #ffffff 0%, #646cff 50%, #ffffff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 200%",
                animation: "textShimmer 4s ease-in-out infinite",
                "&:hover": {
                  opacity: 0.8,
                },
                "@keyframes textShimmer": {
                  "0%, 100%": {
                    backgroundPosition: "0% 50%",
                  },
                  "50%": {
                    backgroundPosition: "100% 50%",
                  },
                },
              }}
              onClick={handleLogoClick}
            >
              TUM Study Planner
            </Typography>
          </Box>

          {isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* AI Chat Toggle Button */}
              <Tooltip title={aiChatOpen ? "Close AI Chat" : "Open AI Chat"}>
                <IconButton
                  onClick={handleAiChatToggle}
                  sx={{
                    color: aiChatOpen ? "#646cff" : "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      opacity: 0.8,
                      backgroundColor: "rgba(100, 108, 255, 0.1)",
                    },
                  }}
                  disableRipple
                >
                  <SmartToy />
                </IconButton>
              </Tooltip>

              {/* User Avatar */}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{ color: "white" }}
                disableRipple
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#646cff",
                    fontSize: "14px",
                    "&:hover": {
                      opacity: 0.8,
                    },
                  }}
                >
                  {userEmail ? (
                    userEmail.charAt(0).toUpperCase()
                  ) : (
                    <AccountCircle />
                  )}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  "& .MuiPaper-root": {
                    backgroundColor: "rgba(42, 42, 42, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    minWidth: "160px",
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  disableRipple
                  onClick={handleProfile}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(100, 108, 255, 0.1)",
                      borderRadius: 2,
                    },
                  }}
                >
                  <Person sx={{ mr: 1, fontSize: "20px" }} />
                  View Profile
                </MenuItem>
                <MenuItem
                  disableRipple
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    color: "#ff6b6b",
                    "&:hover": {
                      backgroundColor: "rgba(244, 67, 54, 0.1)",
                    },
                  }}
                >
                  <ExitToApp sx={{ mr: 1, fontSize: "20px" }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  borderRadius: "25px",
                  fontWeight: 500,
                  "&:hover": {
                    borderColor: "#646cff",
                    backgroundColor: "rgba(100, 108, 255, 0.1)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/signup")}
                sx={{
                  background:
                    "linear-gradient(135deg, #646cff 0%, #535bf2 100%)",
                  color: "white",
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  borderRadius: "25px",
                  fontWeight: 600,
                  boxShadow: "0 4px 16px rgba(100, 108, 255, 0.3)",
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
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 24px rgba(100, 108, 255, 0.4)",
                    "&::before": {
                      left: "100%",
                    },
                  },
                  transition: "all 0.3s ease",
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
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* AI Chat Sidebar */}
      {isLoggedIn && (
        <AiChatSidebar
          isOpen={aiChatOpen}
          onClose={() => setAiChatOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
