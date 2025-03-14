export function sanitizeInput(input: string): string {
  // Remove potentially dangerous HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"]/g, '');
  
  // Remove multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

export function sanitizeOrderNumber(orderNumber: string): string {
  // Only allow alphanumeric characters and hyphens
  return orderNumber.replace(/[^a-zA-Z0-9-]/g, '');
}

export function sanitizeEmail(email: string): string {
  // Basic email validation and sanitization
  return email.toLowerCase().trim().replace(/[^a-zA-Z0-9@._-]/g, '');
} 