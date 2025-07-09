// Yellex DApp Configuration
// Production-ready constants for mainnet deployment

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Network Configuration - Multiple free mainnet RPCs for fallback
export const NETWORK = WalletAdapterNetwork.Mainnet;

// Multiple free Solana mainnet RPC endpoints for better reliability
export const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com', // Official Solana Labs
  'https://solana-api.projectserum.com', // Serum
  'https://rpc.ankr.com/solana', // Ankr
  'https://solana-mainnet.rpc.extrnode.com', // Extrnode
  'https://mainnet.helius-rpc.com/?api-key=', // Helius (free tier, no key needed for basic usage)
] as const;

export const RPC_ENDPOINT = RPC_ENDPOINTS[0]; // Default RPC

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

// Yell Tags (fun and expressive)
export const YELL_TAGS = [
  "#CryptoBro",
  "#GhostQueen", 
  "#Gaslighter",
  "#RedFlagParade",
  "#Heartbreaker",
  "#TwoFace",
  "#EnergyVampire",
  "#WalkingRedFlag",
  "#SoulCrusher",
  "#CircusAct",
  "#ToxicEx",
  "#NFTBro"
] as const;

// AI Generated Screams (more emotional and web3-native)
export const AI_SCREAMS = [
  "You absolute degen! Your portfolio is as worthless as your personality! 💸",
  "Hope your seed phrase gets rugpulled just like you rugpulled my heart! 💔",
  "You're the human equivalent of a failed smart contract - buggy and unreliable! 🐛",
  "May all your diamond hands turn to paper and your bags dump to zero! 📉",
  "You're like a Twitter shill - all hype, no substance, pure disappointment! 🤡",
  "I hope you mint worthless NFTs for eternity, you emotional vampire! 🧛‍♂️",
  "Your love was a honeypot scam and I fell for it like a crypto noob! 🍯",
  "You ghosted me harder than a failed blockchain transaction! 👻"
] as const;