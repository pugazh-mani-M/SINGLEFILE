// Branding Configuration - Centralized for easy white-labeling
export const brandConfig = {
  appName: 'WhatsApp CRM',
  companyName: 'Your Company',
  tagline: 'Professional Customer Support Platform',
  
  // Colors - will be injected as CSS variables
  colors: {
    primary: '#0ea5e9',
    primaryDark: '#0284c7',
    whatsappGreen: '#25D366',
    whatsappDark: '#128C7E',
  },
  
  // Logo configuration
  logo: {
    text: 'WA CRM', // Fallback text logo
    url: null, // Set to image URL when available
    width: 32,
    height: 32,
  },
  
  // Feature flags
  features: {
    darkMode: true,
    internalNotes: true,
    customerTags: true,
    slaIndicators: true,
  }
};

// Apply brand colors to CSS variables
export const applyBrandTheme = () => {
  const root = document.documentElement;
  Object.entries(brandConfig.colors).forEach(([key, value]) => {
    root.style.setProperty(`--brand-${key}`, value);
  });
};