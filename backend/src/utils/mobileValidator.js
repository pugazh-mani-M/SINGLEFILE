// Simple mobile number validation utility (no external dependencies)
class MobileNumberValidator {
  
  // Validate and format phone number for WhatsApp
  static validateAndFormat(phoneNumber, defaultCountry = 'US') {
    try {
      // Remove any non-digit characters except +
      let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      // Add + if missing and number doesn't start with it
      if (!cleanNumber.startsWith('+')) {
        // If number starts with country code, add +
        if (cleanNumber.length >= 10) {
          cleanNumber = '+' + cleanNumber;
        } else {
          // Default to US if no country code
          cleanNumber = '+1' + cleanNumber;
        }
      }
      
      // Remove + for WhatsApp format
      const formatted = cleanNumber.replace('+', '');
      
      // Basic validation - must be 10-15 digits
      if (formatted.length < 10 || formatted.length > 15) {
        throw new Error('Phone number must be 10-15 digits');
      }
      
      // Detect country based on prefix
      const country = this.getCountryFromNumber(formatted);
      
      return {
        isValid: true,
        formatted: formatted,
        original: phoneNumber,
        country: country,
        type: 'mobile' // Assume mobile for simplicity
      };
      
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        original: phoneNumber
      };
    }
  }
  
  // Check if number can receive WhatsApp messages
  static canReceiveWhatsApp(phoneNumber) {
    const validation = this.validateAndFormat(phoneNumber);
    
    if (!validation.isValid) {
      return { canReceive: false, reason: validation.error };
    }
    
    return {
      canReceive: true,
      formatted: validation.formatted,
      country: validation.country
    };
  }
  
  // Simple country detection based on common prefixes
  static getCountryFromNumber(number) {
    const countryPrefixes = {
      '1': 'US',
      '44': 'GB', 
      '91': 'IN',
      '86': 'CN',
      '49': 'DE',
      '33': 'FR',
      '39': 'IT',
      '34': 'ES',
      '55': 'BR',
      '52': 'MX',
      '81': 'JP',
      '82': 'KR'
    };
    
    // Check for 1-3 digit country codes
    for (let i = 1; i <= 3; i++) {
      const prefix = number.substring(0, i);
      if (countryPrefixes[prefix]) {
        return countryPrefixes[prefix];
      }
    }
    
    return 'Unknown';
  }
  
  // Get country code from phone number
  static getCountryCode(phoneNumber) {
    const validation = this.validateAndFormat(phoneNumber);
    if (!validation.isValid) return null;
    
    // Extract country code (first 1-3 digits)
    const number = validation.formatted;
    for (let i = 1; i <= 3; i++) {
      const prefix = number.substring(0, i);
      if (this.getCountryFromNumber(number) !== 'Unknown') {
        return prefix;
      }
    }
    return '1'; // Default to US
  }
}

module.exports = MobileNumberValidator;