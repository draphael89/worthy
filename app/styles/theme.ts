export interface ThemeType {
    gradientColors: string[];
    particleColor: string;
    primary: string;
    secondary: string;
    text: string;
    background: string;
    fontFamily: string;
    textSecondary: string;
    paper: string; // Added paper property
  }
  
  export const lightTheme: ThemeType = {
    gradientColors: ['#ff7e5f', '#feb47b', '#ffcb80'],
    particleColor: '#ff7e5f',
    primary: '#ff7e5f',
    secondary: '#feb47b',
    text: '#333333',
    textSecondary: '#666666',
    background: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    paper: '#f5f5f5', // Added paper property
  };
  
  export const darkTheme: ThemeType = {
    gradientColors: ['#2c3e50', '#3498db', '#2980b9'],
    particleColor: '#3498db',
    primary: '#3498db',
    secondary: '#2980b9',
    text: '#ffffff',
    textSecondary: '#cccccc',
    background: '#1a1a1a',
    fontFamily: 'Arial, sans-serif',
    paper: '#2c2c2c', // Added paper property
  };
  
  // Default theme
  export const defaultTheme = lightTheme;
  
  // Theme toggle function
  export const toggleTheme = (currentTheme: ThemeType): ThemeType => {
    return currentTheme === lightTheme ? darkTheme : lightTheme;
  };