import { MD3DarkTheme } from 'react-native-paper';

export const colors = {
  navy: '#0B1220',
  navySoft: '#121A2F',
  card: '#162033',
  purple: '#7C5CFF',
  blue: '#4C8DFF',
  white: '#F7F8FC',
  muted: '#9AA4B2',
  success: '#22C55E',
  danger: '#F43F5E',
};

export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.purple,
    secondary: colors.blue,
    background: colors.navy,
    surface: colors.card,
    onSurface: colors.white,
    onBackground: colors.white,
  },
};
