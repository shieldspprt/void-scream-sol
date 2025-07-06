import React, { useState, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Mic, Square, Play, Pause, Trash2, Flame, MessageSquare, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EX_TYPES = [
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
];

const AI_SCREAMS = [
  "You absolute buffoon! Your existence is a glitch in the matrix of common sense!",
  "I hope your WiFi disconnects every time you're about to save something important!",
  "You're like a software update - nobody wants you and you make everything worse!",
  "May all your crypto investments turn into rugpulls, you magnificent disaster!",
  "You're the human equivalent of a 404 error - completely useless and impossible to find when needed!",
  "I hope every meme you create dies in new and your NFTs become worthless JPEGs!"
];

export const YellForm = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [message, setMessage] = useState('');
  const [exType, setExType] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "🎤 Recording started",
        description: "Let it all out! Your voice will be heard.",
      });
    } catch (error) {
      toast({
        title: "❌ Microphone Error",
        description: "Could not access microphone. Check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "🛑 Recording stopped",
        description: "Your scream has been captured!",
      });
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const generateAiScream = () => {
    const randomScream = AI_SCREAMS[Math.floor(Math.random() * AI_SCREAMS.length)];
    setMessage(randomScream);
    toast({
      title: "🤖 AI Scream Generated",
      description: "Artificial intelligence meets authentic rage!",
    });
  };

  const submitYell = async (action: 'burn' | 'post') => {
    if (!publicKey || !signTransaction) {
      toast({
        title: "❌ Wallet not connected",
        description: "Connect your Phantom wallet to unleash your rage!",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim() && !audioBlob) {
      toast({
        title: "❌ Empty scream",
        description: "You need to write something or record audio first!",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    let transactionSignature = null;
    
    try {
      // For posting to wall, process payment
      if (action === 'post') {
        toast({
          title: "💸 Processing payment",
          description: "Sending 0.01 SOL to Yellex...",
        });

        const recipientPubkey = new PublicKey('BMgz5grWtsgHsoPnrczXZdhDgT3wBSufNjyYU5jFyFrs');
        const lamports = 0.01 * LAMPORTS_PER_SOL;

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubkey,
            lamports,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signedTransaction = await signTransaction(transaction);
        transactionSignature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        toast({
          title: "⏳ Confirming transaction",
          description: "Waiting for blockchain confirmation...",
        });

        await connection.confirmTransaction(transactionSignature);
      }

      // Convert audio to base64 if present
      let audioData = null;
      if (audioBlob) {
        const reader = new FileReader();
        audioData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result?.toString().split(',')[1]);
          reader.readAsDataURL(audioBlob);
        });
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('screams')
        .insert({
          message: message || null,
          ex_type: exType || null,
          has_audio: !!audioBlob,
          audio_data: audioData,
          action,
          wallet_address: publicKey.toString(),
          transaction_signature: transactionSignature
        });

      if (dbError) {
        throw new Error('Failed to save to database');
      }

      if (action === 'burn') {
        toast({
          title: "🔥 BURNED FOREVER!",
          description: "Your scream has been sent to the void. It's gone forever, just like your ex should be.",
          className: "border-destructive"
        });
      } else {
        toast({
          title: "📢 Posted to Wall of Screams!",
          description: "Your anonymous rage is now public and payment confirmed!",
          className: "border-neon-cyan"
        });
      }

      // Reset form
      setMessage('');
      setExType('');
      setAudioBlob(null);
      
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "❌ Transaction failed",
        description: error.message || "Something went wrong. Your rage remains trapped!",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Terminal Header */}
      <Card className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot bg-destructive"></div>
          <div className="terminal-dot bg-secondary"></div>
          <div className="terminal-dot bg-primary"></div>
          <span className="text-sm font-mono ml-2">yellex_terminal_v1.0</span>
        </div>
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl font-mono text-center py-4">
            <span className="glitch" data-text="PREPARE YOUR RAGE">
              PREPARE YOUR RAGE
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          {/* Ex Type Selector */}
          <div className="space-y-4 animate-pulse-slow">
            <label className="text-xl font-mono text-neon-green font-bold flex items-center gap-2">
              &gt; SELECT_EX_TYPE:
              <span className="text-neon-pink text-sm">(Required)</span>
            </label>
            <Select value={exType} onValueChange={setExType}>
              <SelectTrigger className="terminal-window font-mono h-14 text-lg border-2 border-neon-green shadow-glow-green hover:shadow-glow-green-lg transition-all duration-300">
                <SelectValue placeholder="What kind of disaster were they? (Click to select)" />
              </SelectTrigger>
              <SelectContent className="terminal-window border-neon-green border-2 shadow-glow-green">
                {EX_TYPES.map((type) => (
                  <SelectItem 
                    key={type} 
                    value={type} 
                    className="font-mono hover:bg-neon-green/20 py-4 text-lg cursor-pointer transition-colors duration-200"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Methods */}
          <Tabs defaultValue="voice" className="space-y-6">
            <TabsList className="grid grid-cols-2 terminal-window h-14">
              <TabsTrigger value="text" className="font-mono text-base py-3">
                📝 Text Rage
              </TabsTrigger>
              <TabsTrigger value="voice" className="font-mono text-base py-3">
                🎤 Voice Scream
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-base font-mono text-neon-green font-bold">
                    &gt; COMPOSE_SCREAM:
                  </label>
                  <Button
                    onClick={generateAiScream}
                    variant="outline"
                    size="default"
                    className="btn-glitch h-10"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Let it all out... they'll never see this (unless you post it to the wall)"
                  className="min-h-40 terminal-window font-mono text-foreground bg-input border-primary/30 focus:border-primary resize-none text-base p-4"
                  maxLength={280}
                />
                <div className="text-right text-sm text-muted-foreground font-mono">
                  {message.length}/280 characters
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-6">
              <div className="space-y-6">
                <label className="text-base font-mono text-neon-green font-bold">
                  &gt; RECORD_VOICE_SCREAM:
                </label>
                
                <div className="flex items-center justify-center gap-4 p-12 terminal-window">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="btn-neon h-16 px-8 text-lg"
                      disabled={isSubmitting}
                    >
                      <Mic className="h-6 w-6 mr-3" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      className="btn-yell animate-pulse h-16 px-8 text-lg"
                    >
                      <Square className="h-6 w-6 mr-3" />
                      Stop Recording
                    </Button>
                  )}
                </div>

                {audioBlob && (
                  <div className="flex items-center justify-center gap-4 p-6 terminal-window">
                    <Button
                      onClick={playAudio}
                      disabled={isPlaying}
                      className="btn-glitch h-12 px-6"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Play Recording
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setAudioBlob(null)}
                      variant="outline"
                      size="default"
                      className="btn-neon h-12 px-4"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-primary/30">
            <Button
              onClick={() => submitYell('burn')}
              disabled={isSubmitting || (!message.trim() && !audioBlob)}
              className="btn-yell h-20 text-xl flex flex-col gap-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 shadow-lg shadow-red-600/50 transform transition-transform duration-300 hover:scale-105"
            >
              <div className="flex items-center">
                <Flame className="h-7 w-7 mr-3 text-yellow-300 animate-pulse" />
                BURN FOREVER
              </div>
              <div className="text-sm opacity-90 text-yellow-200">FREE</div>
            </Button>
            
            <Button
              onClick={() => submitYell('post')}
              disabled={isSubmitting || (!message.trim() && !audioBlob)}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-bold rounded-md transform transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/70 h-20 text-xl flex flex-col gap-1 ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50"
            >
              <div className="flex items-center">
                <MessageSquare className="h-7 w-7 mr-3 animate-pulse text-white" />
                POST TO WALL
              </div>
              <div className="text-sm opacity-90">0.01 SOL</div>
            </Button>
          </div>

          {exType && (
            <div className="text-center pt-4">
              <Badge variant="outline" className="terminal-window text-neon-pink border-neon-pink text-base py-2 px-4">
                Targeting: {exType}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};