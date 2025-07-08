import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Mic, Square, Play, Pause, Trash2, Flame, MessageSquare, Sparkles } from 'lucide-react';
import { useYellSubmission } from '@/hooks/useYellSubmission';
import { YELL_TAGS, AI_SCREAMS, MAX_MESSAGE_LENGTH, MAX_AUDIO_DURATION_MS } from '@/config/constants';

export const YellForm = () => {
  const { submitYell, isSubmitting } = useYellSubmission();
  const [message, setMessage] = useState('');
  const [exType, setExType] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        setRecordingStartTime(null);
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      
      // Auto-stop recording after maximum duration
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && isRecording) {
          stopRecording();
          toast({
            title: "⏰ Recording stopped",
            description: "Maximum recording time reached (30 seconds).",
          });
        }
      }, MAX_AUDIO_DURATION_MS);
      
      toast({
        title: "🎤 Recording started",
        description: "Let it all out! Your voice will be heard.",
      });
    } catch (error: any) {
      console.error('Recording error:', error);
      let errorMsg = "Could not access microphone. Check permissions.";
      
      if (error.name === 'NotAllowedError') {
        errorMsg = "Microphone access denied. Please allow microphone permissions.";
      } else if (error.name === 'NotFoundError') {
        errorMsg = "No microphone found. Please connect a microphone.";
      }
      
      toast({
        title: "❌ Microphone Error",
        description: errorMsg,
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      toast({
        title: "🛑 Recording stopped",
        description: "Your scream has been captured!",
      });
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      try {
        const url = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(url);
        audioRef.current.play();
        setIsPlaying(true);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          toast({
            title: "❌ Playback Error",
            description: "Could not play audio recording.",
            variant: "destructive"
          });
        };
      } catch (error) {
        toast({
          title: "❌ Audio Error",
          description: "Failed to load audio for playback.",
          variant: "destructive"
        });
      }
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

  const handleSubmitYell = async (action: 'burn' | 'post') => {
    const result = await submitYell(action, {
      message,
      exType,
      audioBlob
    });

    if (result.success) {
      // Reset form on success
      setMessage('');
      setExType('');
      setAudioBlob(null);
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
                {YELL_TAGS.map((type) => (
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
                  maxLength={MAX_MESSAGE_LENGTH}
                />
                <div className="text-right text-sm text-muted-foreground font-mono">
                  {message.length}/{MAX_MESSAGE_LENGTH} characters
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
              onClick={() => handleSubmitYell('burn')}
              disabled={isSubmitting || (!message.trim() && !audioBlob) || !exType}
              className="btn-yell h-20 text-xl flex flex-col gap-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 shadow-lg shadow-red-600/50 transform transition-transform duration-300 hover:scale-105"
            >
              <div className="flex items-center">
                <Flame className="h-7 w-7 mr-3 text-yellow-300 animate-pulse" />
                {isSubmitting ? 'BURNING...' : 'BURN FOREVER'}
              </div>
              <div className="text-sm opacity-90 text-yellow-200">FREE</div>
            </Button>
            
            <Button
              onClick={() => handleSubmitYell('post')}
              disabled={isSubmitting || (!message.trim() && !audioBlob) || !exType}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-bold rounded-md transform transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/70 h-20 text-xl flex flex-col gap-1 ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50"
            >
              <div className="flex items-center">
                <MessageSquare className="h-7 w-7 mr-3 animate-pulse text-white" />
                {isSubmitting ? 'POSTING...' : 'POST TO WALL'}
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