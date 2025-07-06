import React, { useState, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Mic, Square, Play, Pause, Trash2, Flame, MessageSquare, Sparkles } from 'lucide-react';

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
    if (!publicKey) {
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
    
    try {
      // Simulate payment processing (0.01 SOL)
      toast({
        title: "💸 Processing payment",
        description: "Sending 0.01 SOL to the void...",
      });

      // Simulate delay for blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock NFT metadata
      const nftMetadata = {
        message: message || "[Voice Note]",
        exType,
        timestamp: new Date().toISOString(),
        audioData: audioBlob ? "voice_note_data" : null,
        action
      };

      if (action === 'burn') {
        toast({
          title: "🔥 BURNED FOREVER!",
          description: "Your scream has been sent to the Solana burn address. It's gone forever, just like your ex should be.",
          className: "border-destructive"
        });
      } else {
        toast({
          title: "📢 Posted to Wall of Screams!",
          description: "Your anonymous rage is now public. Let the healing begin!",
          className: "border-neon-cyan"
        });
      }

      // Reset form
      setMessage('');
      setExType('');
      setAudioBlob(null);
      
    } catch (error) {
      toast({
        title: "❌ Transaction failed",
        description: "Something went wrong. Your rage remains trapped!",
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
          <div className="space-y-4">
            <label className="text-base font-mono text-neon-green font-bold">
              &gt; SELECT_EX_TYPE:
            </label>
            <Select value={exType} onValueChange={setExType}>
              <SelectTrigger className="terminal-window font-mono h-12 text-base">
                <SelectValue placeholder="What kind of disaster were they?" />
              </SelectTrigger>
              <SelectContent className="terminal-window border-primary/30">
                {EX_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="font-mono hover:bg-primary/20 py-3">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Methods */}
          <Tabs defaultValue="text" className="space-y-6">
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
              className="btn-yell h-20 text-xl flex flex-col gap-1"
            >
              <div className="flex items-center">
                <Flame className="h-7 w-7 mr-3" />
                BURN FOREVER
              </div>
              <div className="text-sm opacity-90">0.01 SOL</div>
            </Button>
            
            <Button
              onClick={() => submitYell('post')}
              disabled={isSubmitting || (!message.trim() && !audioBlob)}
              className="bg-gradient-to-r from-accent via-secondary to-accent text-accent-foreground font-bold rounded-md transform transition-all duration-200 hover:scale-105 hover:shadow-glow-cyan h-20 text-xl flex flex-col gap-1"
            >
              <div className="flex items-center">
                <MessageSquare className="h-7 w-7 mr-3" />
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