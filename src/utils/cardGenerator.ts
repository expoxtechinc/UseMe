/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Generate a valid card number of length 16 starting with prefix 4 (Visa)
export function generateVisaNumber(tier: string = 'classic'): string {
  // Use slightly different BIN ranges for different tiers to make it look realistic!
  // Visa BINs: 4111 (Classic), 4532 (Gold), 4916 (Platinum), 4000 (Infinite)
  let prefix = '4111';
  if (tier === 'gold') prefix = '4532';
  if (tier === 'platinum') prefix = '4916';
  if (tier === 'infinite') prefix = '4000';

  let num = prefix;
  // Generate up to 15 digits
  while (num.length < 15) {
    num += Math.floor(Math.random() * 10).toString();
  }

  // Calculate the Luhn check digit for the 16th position
  const checkDigit = calculateLuhnCheckDigit(num);
  return num + checkDigit;
}

// Calculate the Luhn algorithm check digit
function calculateLuhnCheckDigit(numberStr: string): string {
  let sum = 0;
  let shouldDouble = true; // Since we are adding to the end, working backwards from the 16th digit (index 15, which is doubled or not depending on position)
  
  // To find the 16th digit, we simulate adding '0' as the 16th digit, then do the calculation backwards
  const tempStr = numberStr + '0';
  
  for (let i = tempStr.length - 1; i >= 0; i--) {
    let digit = parseInt(tempStr.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  const mod = sum % 10;
  const checkDigit = mod === 0 ? 0 : 10 - mod;
  return checkDigit.toString();
}

// Check if a card number is valid under the Luhn algorithm
export function validateLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (!sanitized.startsWith('4')) return false; // Must be Visa
  if (sanitized.length !== 16) return false;

  let sum = 0;
  let shouldDouble = false;
  
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

// Format credit card number with spaces (e.g., 4111 2222 3333 4444)
export function formatCardNumber(num: string): string {
  const clean = num.replace(/\D/g, '');
  const chunks = clean.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : clean;
}

// Generate random expiry date (2 to 5 years in the future)
export function generateExpiry(): { month: string; year: string; formatted: string } {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const futureYears = Math.floor(Math.random() * 4) + 2; // 2 to 5 years
  const currentYear = new Date().getFullYear();
  const year = String((currentYear + futureYears) % 100).padStart(2, '0');
  return {
    month,
    year,
    formatted: `${month}/${year}`,
  };
}

// Generate random CVV
export function generateCVV(): string {
  return String(Math.floor(Math.random() * 900) + 100);
}
