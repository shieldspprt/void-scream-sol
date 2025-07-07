// Yellex DApp Configuration
// Production-ready constants for mainnet deployment

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Network Configuration
export const NETWORK = WalletAdapterNetwork.Mainnet;
export const RPC_ENDPOINT = clusterApiUrl('mainnet-beta'); // Free Solana mainnet RPC

// Payment Configuration
export const YELLEX_TREASURY_WALLET = 'BMgz5grWtsgHsoPnrczXZdhDgT3wBSufNjyYU5jFyFrs';
export const POST_PRICE_SOL = 0.01;

// App Configuration
export const MAX_MESSAGE_LENGTH = 280;
export const MAX_AUDIO_DURATION_MS = 30000; // 30 seconds
export const TRANSACTION_TIMEOUT_MS = 60000; // 60 seconds
export const MAX_RETRIES = 3;

// Validation
export const SOLANA_ADDRESS_LENGTH = 44;
export const MIN_MESSAGE_LENGTH = 1;

// Ex Types
export const EX_TYPES = [
  "💸 Crypto Bro",
  "🌪️ Gaslighter", 
  "👻 Ghoster",
  "🤡 Red Flag Parade",
  "💔 Heartbreaker",
  "🎭 Two-Face",
  "🧛 Energy Vampire",
  "🚩 Walking Red Flag",
  "💀 Soul Crusher",
  "🎪 Circus Act"
] as const;

// AI Generated Screams
export const AI_SCREAMS = [
  "You absolute buffoon! Your existence is a glitch in the matrix of common sense!",
  "I hope your WiFi disconnects every time you're about to save something important!",
  "You're like a software update - nobody wants you and you make everything worse!",
  "May all your crypto investments turn into rugpulls, you magnificent disaster!",
  "You're the human equivalent of a 404 error - completely useless and impossible to find when needed!",
  "I hope every meme you create dies in new and your NFTs become worthless JPEGs!"
] as const;