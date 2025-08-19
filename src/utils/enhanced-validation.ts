// Enhanced validation utilities for Yellex DApp security
import { PublicKey } from '@solana/web3.js';
import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH, SOLANA_ADDRESS_LENGTH } from '@/config/constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Enhanced wallet address validation with better security checks
export const validateWalletAddress = (address: string): ValidationResult => {
  if (!address || typeof address !== 'string') {
    return { isValid: false, error: 'Wallet address is required' };
  }

  // Trim whitespace
  const trimmedAddress = address.trim();

  if (trimmedAddress.length !== SOLANA_ADDRESS_LENGTH) {
    return { isValid: false, error: 'Invalid wallet address length' };
  }

  // Check for invalid characters
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmedAddress)) {
    return { isValid: false, error: 'Invalid wallet address characters' };
  }

  try {
    new PublicKey(trimmedAddress);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid wallet address format' };
  }
};

// Enhanced message validation with stricter security
export const validateMessage = (message: string): ValidationResult => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message is required' };
  }

  const trimmed = message.trim();
  
  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    return { isValid: false, error: 'Message is too short' };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { isValid: false, error: `Message is too long. Max ${MAX_MESSAGE_LENGTH} characters.` };
  }

  // Enhanced XSS prevention
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Invalid characters detected' };
    }
  }

  return { isValid: true };
};

// Enhanced audio blob validation with strict security checks
export const validateAudioBlob = (blob: Blob | null): ValidationResult => {
  if (!blob) {
    return { isValid: false, error: 'Audio data is required' };
  }

  if (blob.size === 0) {
    return { isValid: false, error: 'Audio file is empty' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (blob.size > maxSize) {
    return { isValid: false, error: 'Audio file is too large (max 5MB)' };
  }

  // Validate MIME type
  const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
  if (!allowedTypes.includes(blob.type)) {
    return { isValid: false, error: 'Invalid audio file type' };
  }

  return { isValid: true };
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }

    const userRequests = requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    return true; // Request allowed
  };
};

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .substring(0, MAX_MESSAGE_LENGTH); // Ensure max length
};

// Validate transaction signature format
export const validateTransactionSignature = (signature: string): ValidationResult => {
  if (!signature || typeof signature !== 'string') {
    return { isValid: false, error: 'Transaction signature is required' };
  }

  // Solana transaction signatures are base58 encoded and typically 87-88 characters
  if (signature.length < 87 || signature.length > 88) {
    return { isValid: false, error: 'Invalid transaction signature length' };
  }

  // Check for valid base58 characters
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(signature)) {
    return { isValid: false, error: 'Invalid transaction signature format' };
  }

  return { isValid: true };
};