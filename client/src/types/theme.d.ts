// src/theme.d.ts
import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      tum_blue: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      tum_blue: string;
    };
  }
}