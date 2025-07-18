import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#646cff",
    },
    secondary: {
      main: "#dc004e",
    },
    custom: {
      tum_blue: "#0165BD",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  // Override z-index values to allow dialogs to work with AI chat sidebar
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1150, // Lower than drawer so dialogs appear behind AI chat sidebar
    snackbar: 1400,
    tooltip: 1500,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#333333",
        },
      },
    },
    // Make dialogs responsive to AI chat sidebar
    MuiDialog: {
      styleOverrides: {
        root: {
          // Use CSS variables that are controlled by the navbar for both sidebars
          marginLeft: "var(--sidebar-width, 0px)",
          marginRight: "var(--ai-chat-width, 0px)",
          transition: "margin-left 0.3s ease, margin-right 0.3s ease",
          marginTop: "64px",
        },
      },
      defaultProps: {
        // Disable focus trapping to allow interaction with AI chat
        disableEnforceFocus: true,
        disableAutoFocus: true,
        // Keep backdrop but don't close on backdrop click when AI chat is open
        disableEscapeKeyDown: false,
      },
    },
    // Also handle the backdrop specifically
    MuiBackdrop: {
      styleOverrides: {
        root: {
          // Make backdrop less opaque to show AI chat is still accessible
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
      },
    },
  },
});
