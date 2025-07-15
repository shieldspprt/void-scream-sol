import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Mic, Square, Play, Pause, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { useYellSubmission } from '@/hooks/useYellSubmission';
import { SuccessConfirmation } from './SuccessConfirmation';

interface YellFormProps {
  onSuccessfulPost?: () => void;
}
import { YELL_TAGS, AI_SCREAMS, MAX_MESSAGE_LENGTH, MAX_AUDIO_DURATION_MS } from '@/config/constants';

export const YellForm = ({ onSuccessfulPost }: YellFormProps) => {
  const { submitYell, isSubmitting } = useYellSubmission();
  const [message, setMessage] = useState('');
  const [exType, setExType] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmitYell = async () => {
    console.log('🔥 Submit button clicked!', { 
      hasMessage: !!message.trim(), 
      hasAudio: !!audioBlob, 
      exType,
      isSubmitting 
    });

    // Check if we have content and ex type
    if (!message.trim() && !audioBlob) {
      toast({
        title: "❌ Empty scream",
        description: "You need to write something or record audio first!",
        variant: "destructive"
      });
      return;
    }

    if (!exType) {
      toast({
        title: "❌ Ex type required", 
        description: "Please select what kind of disaster they were!",
        variant: "destructive"
      });
      return;
    }

    const result = await submitYell('post', {
      message,
      exType,
      audioBlob
    });

    if (result.success) {
      // Show success confirmation
      setShowSuccessModal(true);
      
      // Trigger wall refresh
      onSuccessfulPost?.();
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Compact Terminal Header */}
      <Card className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot bg-destructive"></div>
          <div className="terminal-dot bg-secondary"></div>
          <div className="terminal-dot bg-primary"></div>
          <span className="text-sm font-mono ml-2">yellex_post.exe</span>
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-mono text-center py-2">
            <span className="glitch" data-text="COMPOSE RAGE">
              COMPOSE RAGE
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Ex Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-mono text-neon-green font-bold flex items-center gap-2">
              &gt; SELECT_EX_TYPE:
              <span className="text-neon-pink text-xs">(Required)</span>
            </label>
            <Select value={exType} onValueChange={setExType}>
              <SelectTrigger className="terminal-window font-mono h-12 text-sm border-2 border-primary/30 hover:border-neon-green glow-neon transition-all duration-300">
                <SelectValue placeholder="What kind of disaster were they?" />
              </SelectTrigger>
              <SelectContent className="terminal-window border-neon-green border-2 glow-neon">
                {YELL_TAGS.map((type) => (
                  <SelectItem 
                    key={type} 
                    value={type} 
                    className="font-mono hover:bg-neon-green/20 py-3 cursor-pointer transition-colors duration-200"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Methods */}
          <Tabs defaultValue="voice" className="space-y-4">
            <TabsList className="grid grid-cols-2 terminal-window h-12">
              <TabsTrigger value="text" className="font-mono text-sm py-2">
                📝 Text
              </TabsTrigger>
              <TabsTrigger value="voice" className="font-mono text-sm py-2">
                🎤 Voice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-mono text-neon-green font-bold">
                    &gt; COMPOSE:
                  </label>
                  <Button
                    onClick={generateAiScream}
                    variant="outline"
                    size="sm"
                    className="btn-glitch h-8"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Button>
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Let it all out..."
                  className="min-h-32 terminal-window font-mono text-foreground bg-input border-primary/30 focus:border-primary resize-none text-sm p-3"
                  maxLength={MAX_MESSAGE_LENGTH}
                />
                <div className="text-right text-xs text-muted-foreground font-mono">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <div className="space-y-4">
                <label className="text-sm font-mono text-neon-green font-bold">
                  &gt; RECORD:
                </label>
                
                <div className="flex items-center justify-center gap-3 p-8 terminal-window">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      size="default"
                      className="btn-neon h-12 px-6"
                      disabled={isSubmitting}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Record
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      size="default"
                      className="btn-yell animate-pulse h-12 px-6"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>

                {audioBlob && (
                  <div className="flex items-center justify-center gap-3 p-4 terminal-window">
                    <Button
                      onClick={playAudio}
                      disabled={isPlaying}
                      className="btn-glitch h-10 px-4"
                      size="sm"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Playing
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setAudioBlob(null)}
                      variant="outline"
                      size="sm"
                      className="btn-neon h-10 px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Action Button - Mobile Optimized */}
          <div className="pt-6 border-t border-primary/30 space-y-4">
            <Button
              onClick={handleSubmitYell}
              disabled={isSubmitting || (!message.trim() && !audioBlob) || !exType}
              className="w-full h-16 sm:h-14 bg-gradient-to-br from-neon-pink via-neon-purple to-neon-cyan text-black font-mono font-black text-xl sm:text-lg rounded-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-neon-glow active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group border-2 border-white/30 touch-manipulation cursor-pointer"
            >
              {/* Bright background for text contrast */}
              <div className="absolute inset-0 bg-white/90 group-hover:bg-white transition-colors duration-300" />
              
              {/* Animated border glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-purple rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex items-center justify-center gap-3 z-10 px-4">
                <span className="text-2xl">💰</span>
                <span className="tracking-wide font-black text-black drop-shadow-none">
                  {isSubmitting ? 'UNLEASHING CHAOS...' : 'SCREAM FOR REVENGE!'}
                </span>
                <span className="text-2xl">🚀</span>
              </div>
            </Button>
            
            {/* Mobile-optimized Reset Button */}
            <Button
              onClick={() => {
                setMessage('');
                setExType('');
                setAudioBlob(null);
              }}
              variant="outline"
              className="w-full h-12 btn-glitch font-mono text-sm touch-manipulation"
            >
              🔄 RESET RAGE
            </Button>
          </div>

          {exType && (
            <div className="text-center pt-2">
              <Badge variant="outline" className="terminal-window text-neon-pink border-neon-pink text-sm py-1 px-3">
                Target: {exType}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Success Confirmation Modal */}
      <SuccessConfirmation
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onYellAgain={() => {
          setMessage('');
          setExType('');
          setAudioBlob(null);
        }}
      />
    </div>
  );
};
