// Input validation utilities for Yellex DApp
import { PublicKey } from '@solana/web3.js';
import { MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH, SOLANA_ADDRESS_LENGTH } from '@/config/constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Validate Solana wallet address
export const validateWalletAddress = (address: string): ValidationResult => {
  if (!address || typeof address !== 'string') {
    return { isValid: false, error: 'Wallet address is required' };
  }

  if (address.length !== SOLANA_ADDRESS_LENGTH) {
    return { isValid: false, error: 'Invalid wallet address length' };
  }

  try {
    new PublicKey(address);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid wallet address format' };
  }
};

// Validate message content
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

  // Basic XSS prevention
  if (/<script|javascript:|on\w+=/i.test(trimmed)) {
    return { isValid: false, error: 'Invalid characters detected' };
  }

  return { isValid: true };
};

// Validate ex type selection
export const validateExType = (exType: string): ValidationResult => {
  if (!exType || typeof exType !== 'string') {
    return { isValid: false, error: 'Ex type selection is required' };
  }

  return { isValid: true };
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// Validate audio blob
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

  return { isValid: true };
};