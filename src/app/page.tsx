'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Heart, 
  Sparkles, 
  Flame, 
  Wand2,
  ChevronRight,
  ChevronLeft,
  Twitter,
  Copy,
  Check,
  Zap,
  Wallet,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { historianData } from '@/lib/historians';
import { WalletConnectButton } from '@/components/WalletButton';

interface Historian {
  id: string;
  name: string;
  era: string;
  title: string;
  image: string;
  emoji: string;
  personality: string;
  roastStyle: string;
  flirtStyle: string;
  color: string;
}

interface Response {
  success: boolean;
  submissionId: string;
  response: string;
  responseType: 'roast' | 'flirt';
  historian: {
    name: string;
    emoji: string;
    color: string;
  };
}

// Price in SOL
const PRICE_SOL = 0.001;
const FREE_ATTEMPTS = 3;

export default function Home() {
  const { publicKey, connected, signTransaction } = useWallet();
  const [historians, setHistorians] = useState<Historian[]>([]);
  const [selectedHistorian, setSelectedHistorian] = useState<Historian | null>(null);
  const [pickupLine, setPickupLine] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'select' | 'write' | 'response'>('select');
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [freeAttemptsUsed, setFreeAttemptsUsed] = useState(0);

  // Load free attempts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('yellex_free_attempts');
    if (saved) {
      setFreeAttemptsUsed(parseInt(saved, 10));
    }
  }, []);

  // Save free attempts to localStorage
  useEffect(() => {
    localStorage.setItem('yellex_free_attempts', freeAttemptsUsed.toString());
  }, [freeAttemptsUsed]);

  const remainingFree = Math.max(0, FREE_ATTEMPTS - freeAttemptsUsed);
  const needsPayment = freeAttemptsUsed >= FREE_ATTEMPTS;

  // Fetch historians
  useEffect(() => {
    fetch('/api/historians')
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        // Validate that data is an array
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        setHistorians(data);
      })
      .catch(() => {
        // Fallback to static data with IDs
        setHistorians(historianData.map((h, i) => ({ ...h, id: `historian-${i}` })));
      });
  }, []);

  const handleSelectHistorian = (historian: Historian) => {
    setSelectedHistorian(historian);
    setStep('write');
    setResponse(null);
    setTxSignature(null);
  };

  const handleBackToWrite = () => {
    setStep('write');
    setResponse(null);
    setTxSignature(null);
    setPickupLine('');
  };

  const handleSuggest = async () => {
    if (!selectedHistorian) return;
    
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historianName: selectedHistorian.name,
          historianPersonality: selectedHistorian.personality
        })
      });
      const data = await res.json();
      setPickupLine(data.suggestion);
    } catch {
      toast.error('Failed to generate suggestion');
    }
    setIsSuggesting(false);
  };

  const handlePayment = async () => {
    if (!publicKey || !connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!pickupLine.trim() || !selectedHistorian) {
      toast.error('Please write a pickup line!');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Dynamic import for Solana
      const { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } = await import('@solana/web3.js');
      
      // Connect to Solana (devnet for testing)
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      // Create transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      // Treasury wallet - fee collection address
      const treasuryAddress = new PublicKey('DD4AdYKVcV6kgpmiCEeASRmJyRdKgmaRAbsjKucx8CvY');
      
      // Convert SOL to lamports
      const lamports = Math.floor(PRICE_SOL * LAMPORTS_PER_SOL);

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryAddress,
          lamports,
        })
      );

      // Sign transaction using wallet adapter
      if (!signTransaction) {
        throw new Error('Wallet does not support signing');
      }

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      setTxSignature(signature);
      toast.success('Payment successful!');
      
      // Now get the response
      await getResponse(signature);

    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled');
      } else {
        toast.error('Payment failed: ' + (error.message || 'Unknown error'));
      }
    }
    setIsProcessingPayment(false);
  };

  const getResponse = async (signature: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLine: pickupLine.trim(),
          historianId: selectedHistorian?.id,
          walletAddress: publicKey?.toBase58(),
          txSignature: signature
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setResponse(data);
        setStep('response');
      } else {
        toast.error('Something went wrong!');
      }
    } catch {
      toast.error('Failed to get response');
    }
    setIsLoading(false);
  };

  // Client-side security validation
  const validatePickupLine = (input: string): { valid: boolean; reason?: string } => {
    if (input.length < 3) {
      return { valid: false, reason: 'Pickup line too short (min 3 chars)' };
    }
    if (input.length > 200) {
      return { valid: false, reason: 'Pickup line too long (max 200 chars)' };
    }
    
    // Block script tags and dangerous patterns
    const blockedPatterns = [
      /<script/i, /javascript:/i, /on\w+\s*=/i, 
      /eval\s*\(/i, /document\.write/i, /fetch\s*\(/i,
      /localStorage/i, /sessionStorage/i, /window\./i
    ];
    
    for (const pattern of blockedPatterns) {
      if (pattern.test(input)) {
        return { valid: false, reason: 'Invalid characters detected' };
      }
    }
    
    // Check excessive caps
    const capsRatio = (input.match(/[A-Z]/g) || []).length / input.length;
    if (capsRatio > 0.7 && input.length > 10) {
      return { valid: false, reason: 'Please don\'t shout!' };
    }
    
    return { valid: true };
  };

  // Free mode - skip payment (for demo)
  const handleFreeSubmit = async () => {
    if (!pickupLine.trim() || !selectedHistorian) {
      toast.error('Please write a pickup line!');
      return;
    }

    // Client-side validation
    const validation = validatePickupLine(pickupLine);
    if (!validation.valid) {
      toast.error(validation.reason);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLine: pickupLine.trim(),
          historianId: selectedHistorian?.id
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setResponse(data);
        setStep('response');
        // Increment free attempts counter
        setFreeAttemptsUsed(prev => prev + 1);
        toast.success(`Free attempt used! ${remainingFree - 1} remaining.`);
      } else {
        toast.error('Something went wrong!');
      }
    } catch {
      toast.error('Failed to get response');
    }
    setIsLoading(false);
  };

  const handleShareX = () => {
    if (!response || !selectedHistorian) return;
    
    const text = `I tried to seduce ${selectedHistorian.name} with: "${pickupLine}"

${response.responseType === 'roast' ? '🔥' : '💕'} ${selectedHistorian.emoji} ${response.response}

Try your luck at Yellex! https://yellex.fun`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopy = async () => {
    if (!response) return;
    
    const text = `${selectedHistorian?.emoji} ${selectedHistorian?.name}:\n"${response.response}"`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep('select');
    setSelectedHistorian(null);
    setPickupLine('');
    setResponse(null);
    setTxSignature(null);
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12"
        >
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2 px-4 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-500/30">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span className="text-xs text-pink-300">Powered by AI</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Yellex
              </span>
            </h1>
          </div>
          
          {/* Wallet Section */}
          <div className="flex items-center gap-3">
            {connected && publicKey ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-slate-300">{formatWalletAddress(publicKey.toBase58())}</span>
              </div>
            ) : (
              <WalletConnectButton />
            )}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Historian */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Pick Your Target
                </h2>
                <p className="text-slate-400">8 legends waiting to roast you</p>
                {/* Free attempts badge */}
                <div className="mt-4">
                  <Badge 
                    variant="outline" 
                    className={`${remainingFree > 0 ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-orange-500/20 text-orange-400 border-orange-500/50'}`}
                  >
                    {remainingFree > 0 ? (
                      <>🎁 {remainingFree} FREE left</>
                    ) : (
                      <>💰 {PRICE_SOL} SOL</>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {historians.map((historian, index) => (
                  <motion.div
                    key={historian.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-slate-800/50 border-slate-700/50 group`}
                      onClick={() => handleSelectHistorian(historian)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${historian.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                      <CardContent className="p-4 text-center relative">
                        <div className="text-5xl mb-3">{historian.emoji}</div>
                        <h3 className="font-bold text-white text-lg">{historian.name}</h3>
                        <p className="text-sm text-slate-400">{historian.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{historian.era}</p>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Write Pickup Line */}
          {step === 'write' && selectedHistorian && (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              {/* Back button */}
              <button 
                onClick={handleReset}
                className="mb-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to selection
              </button>

              {/* Selected Historian */}
              <Card className={`mb-6 overflow-hidden bg-gradient-to-br ${selectedHistorian.color} p-[1px]`}>
                <CardContent className="bg-slate-900 p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{selectedHistorian.emoji}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedHistorian.name}</h2>
                      <p className="text-slate-400">{selectedHistorian.title} • {selectedHistorian.era}</p>
                    </div>
                    {/* Free attempts indicator */}
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`${remainingFree > 0 ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-orange-500/20 text-orange-400 border-orange-500/50'}`}
                      >
                        {remainingFree > 0 ? (
                          <>🎁 {remainingFree} FREE left</>
                        ) : (
                          <>💰 {PRICE_SOL} SOL</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Line Input */}
              <div className="space-y-5">
                {/* Textarea with embedded suggest button */}
                <div className="relative">
                  <label className="block mb-2">
                    <span className="text-white font-semibold text-lg">
                      Your Pickup Line to {selectedHistorian.name}
                    </span>
                  </label>
                  <div className="relative">
                    <Textarea
                      value={pickupLine}
                      onChange={(e) => setPickupLine(e.target.value)}
                      placeholder={`Write something clever for ${selectedHistorian.name}...`}
                      className="min-h-[160px] bg-slate-800/70 border-slate-600 text-white placeholder:text-slate-500 focus:border-pink-500 focus:ring-pink-500/20 text-lg pr-14"
                    />
                    {/* Floating AI Suggest Button */}
                    <button
                      onClick={handleSuggest}
                      disabled={isSuggesting}
                      className="absolute top-3 right-3 p-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="AI Suggestion"
                    >
                      {isSuggesting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Wand2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Prominent Send Button */}
                <div className="pt-2 space-y-4">
                  {/* Free button - show prominently when free attempts available */}
                  {!needsPayment && (
                    <Button
                      onClick={handleFreeSubmit}
                      disabled={isLoading || !pickupLine.trim()}
                      className="w-full h-16 text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white font-bold shadow-xl shadow-purple-500/20 border-2 border-white/10"
                    >
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      ) : (
                        <>
                          <Heart className="w-6 h-6 mr-3" />
                          SEND PICKUP LINE
                          <span className="ml-2 text-sm font-normal opacity-80">
                            🎁 ({remainingFree} free left)
                          </span>
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Payment required message */}
                  {needsPayment && (
                    <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                      <p className="text-orange-300 text-sm mb-2">
                        🎁 You&apos;ve used all {FREE_ATTEMPTS} free attempts!
                      </p>
                      <p className="text-slate-400 text-xs">
                        Connect wallet to continue for {PRICE_SOL} SOL
                      </p>
                    </div>
                  )}
                  
                  {/* Wallet payment option */}
                  {connected && publicKey ? (
                    <Button
                      onClick={handlePayment}
                      disabled={isLoading || isProcessingPayment || !pickupLine.trim()}
                      className={`w-full h-16 text-lg ${needsPayment ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 shadow-xl shadow-purple-500/20 border-2 border-white/10' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'} text-white font-bold`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          Processing Payment...
                        </>
                      ) : isLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          Getting Response...
                        </>
                      ) : needsPayment ? (
                        <>
                          <Zap className="w-6 h-6 mr-3" />
                          PAY {PRICE_SOL} SOL & SEND
                        </>
                      ) : (
                        <>
                          <Heart className="w-6 h-6 mr-3" />
                          SEND (Pay {PRICE_SOL} SOL)
                        </>
                      )}
                    </Button>
                  ) : needsPayment ? (
                    <div className="text-center">
                      <WalletConnectButton />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-950 text-slate-500">or</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Secondary wallet connect option when free attempts remain */}
                  {!connected && !needsPayment && (
                    <Button
                      onClick={() => {}}
                      disabled={true}
                      variant="outline"
                      className="w-full border-slate-600 bg-slate-800/50 text-slate-400 h-12"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect wallet to support us
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Response */}
          {step === 'response' && response && selectedHistorian && (
            <motion.div
              key="response"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              {/* Back button to write page */}
              <button 
                onClick={handleBackToWrite}
                className="mb-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Try another pickup line
              </button>

              {/* Response Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className={`overflow-hidden ${response.responseType === 'roast' ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30' : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30'} border`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{selectedHistorian.emoji}</span>
                        <div>
                          <h3 className="font-bold text-white">{selectedHistorian.name}</h3>
                          <p className="text-sm text-slate-400">{response.responseType === 'roast' ? '🔥 ROASTED!' : '💕 FLIRTED BACK!'}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${response.responseType === 'roast' ? 'bg-orange-500/20 text-orange-300' : 'bg-pink-500/20 text-pink-300'}`}>
                        {response.responseType === 'roast' ? (
                          <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> Roast</span>
                        ) : (
                          <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> Flirt</span>
                        )}
                      </div>
                    </div>

                    {/* Your Line */}
                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Your pickup line:</p>
                      <p className="text-slate-300 italic">&quot;{pickupLine}&quot;</p>
                    </div>

                    {/* Response */}
                    <div className={`p-4 rounded-lg ${response.responseType === 'roast' ? 'bg-orange-500/10' : 'bg-pink-500/10'}`}>
                      <p className="text-lg text-white font-medium">&quot;{response.response}&quot;</p>
                      {response.aiGenerated && (
                        <div className="mt-2">
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                            <Sparkles className="w-3 h-3 mr-1" /> AI Generated
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Transaction Link */}
                    {txSignature && (
                      <div className="mt-4 text-center">
                        <a 
                          href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 flex items-center justify-center gap-1"
                        >
                          View Transaction <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Actions */}
              <motion.div 
                className="mt-6 flex flex-col sm:flex-row gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={handleShareX}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on X
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 border-slate-400 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copied!' : 'Copy Response'}
                </Button>
              </motion.div>

              {/* Try Again */}
              <motion.div 
                className="mt-6 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleBackToWrite}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold px-6"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Another Line
                </Button>
              </motion.div>
              
              {/* Free attempts remaining */}
              {remainingFree > 0 && (
                <motion.p 
                  className="mt-4 text-center text-sm text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  🎁 {remainingFree} free {remainingFree === 1 ? 'attempt' : 'attempts'} remaining
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center text-slate-500 text-sm"
        >
          <p>Powered by AI • {FREE_ATTEMPTS} free attempts • Then {PRICE_SOL} SOL</p>
        </motion.footer>
      </div>
    </div>
  );
}
