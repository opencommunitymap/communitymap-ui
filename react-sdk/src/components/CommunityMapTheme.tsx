import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export const communityMapTheme = createTheme({
  palette: {
    primary: { main: '#147d70', dark: '#09584f', contrastText: '#ffffff' },
    secondary: { main: '#b66b3d' },
    background: { default: '#f5f6f2', paper: '#ffffff' },
    text: { primary: '#203c38', secondary: '#627571' },
    divider: '#e2e9e5',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h5: { fontWeight: 700, letterSpacing: '-0.035em' },
    h6: { fontWeight: 700, letterSpacing: '-0.025em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { padding: '10px 18px' } },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiDialog: {
      defaultProps: { fullWidth: true, maxWidth: 'sm' },
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 24px 80px #163d3829',
          '@media (max-width: 600px)': {
            margin: 16,
            width: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)',
          },
        },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { padding: '24px 28px 16px' } } },
    MuiDialogContent: {
      styleOverrides: { root: { padding: '20px 28px 28px' } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '16px 28px 24px' } },
    },
    MuiTextField: { defaultProps: { fullWidth: true, variant: 'outlined' } },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: '#fafcfb' } },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 8,
          minWidth: 220,
          boxShadow: '0 12px 48px #163d3826',
        },
      },
    },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 44 } } },
    MuiBackdrop: { styleOverrides: { root: { backgroundColor: '#173d3866' } } },
  },
});

export const CommunityMapTheme: React.FC<React.PropsWithChildren> = ({
  children,
}) => <ThemeProvider theme={communityMapTheme}>{children}</ThemeProvider>;
