// Input validation utilities for security
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove HTML/script injection characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 50); // Limit length
}

export function validatePlayerName(name) {
  if (!name || typeof name !== 'string') return false;
  
  const cleaned = sanitizeInput(name);
  return cleaned.length >= 2 && cleaned.length <= 30 && /^[a-zA-Z0-9\s-_]+$/.test(cleaned);
}

export function validateScore(score) {
  return typeof score === 'number' && score > 0 && score < 999999 && Number.isInteger(score);
}