import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Heart, ArrowLeft, Share2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScreamData {
  id: string;
  message: string | null;
  ex_type: string | null;
  created_at: string;
  has_audio: boolean;
  audio_data: string | null;
  likes: number;
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const ScreamPage = () => {
  const { id } = useParams<{ id: string }>();
  const [scream, setScream] = useState<ScreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchScream(id);
    }
  }, [id]);

  const fetchScream = async (screamId: string) => {
    try {
      const { data, error } = await supabase
        .from('screams')
        .select('*')
        .eq('id', screamId)
        .eq('action', 'post')
        .single();

      if (error) throw error;
      setScream(data);
    } catch (error) {
      console.error('Error fetching scream:', error);
      toast({
        title: "Scream not found",
        description: "This scream may have been deleted or doesn't exist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!scream) return;

    try {
      const { error } = await supabase
        .from('screams')
        .update({ likes: scream.likes + 1 })
        .eq('id', scream.id);

      if (error) throw error;

      setScream(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const playAudio = (audioData: string) => {
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setPlayingAudio(true);
      audio.play();
      audio.onended = () => {
        setPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this scream with the world",
      });
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-terminal flex items-center justify-center">
        <div className="text-center font-mono text-neon-green">Loading scream...</div>
      </div>
    );
  }

  if (!scream) {
    return (
      <div className="min-h-screen bg-gradient-terminal flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-mono text-destructive">404 - Scream Not Found</div>
          <Link to="/">
            <Button className="btn-neon">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to YELLEX
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-terminal relative overflow-hidden">
      {/* Terminal scanlines overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-20" />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link to="/">
            <Button variant="secondary" className="btn-neon bg-secondary text-secondary-foreground border-2 border-secondary opacity-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wall
            </Button>
          </Link>
          <h1 className="text-2xl font-bold glitch font-mono" data-text="SINGLE SCREAM">
            SINGLE SCREAM
          </h1>
          <Button onClick={handleShare} className="btn-glitch">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="terminal-window relative overflow-hidden">
            <div className="terminal-header">
              <div className="terminal-dot bg-primary"></div>
              <div className="terminal-dot bg-secondary"></div>
              <div className="terminal-dot bg-accent"></div>
              <span className="text-sm font-mono ml-2">scream_{scream.id.slice(-6)}.dat</span>
            </div>
            
            <CardContent className="p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {scream.ex_type && (
                    <Badge variant="outline" className="terminal-window text-neon-pink border-neon-pink font-mono text-lg py-2 px-4">
                      {scream.ex_type}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatTimeAgo(scream.created_at)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  anonymous_user_{scream.id.slice(-6)}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {scream.has_audio && scream.audio_data ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-6 bg-muted/20 rounded border border-accent/30">
                      <Button
                        onClick={() => playAudio(scream.audio_data!)}
                        size="lg"
                        className="btn-glitch"
                      >
                        {playingAudio ? (
                          <>
                            <Pause className="h-5 w-5 mr-2" />
                            Playing...
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5 mr-2" />
                            Play Audio
                          </>
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Volume2 className="h-5 w-5 text-neon-cyan" />
                          <div className="h-3 bg-muted rounded-full flex-1 overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300 ${
                                playingAudio ? 'w-full' : 'w-0'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {scream.message && (
                      <blockquote className="border-l-4 border-primary pl-6 italic font-mono text-foreground bg-muted/10 p-6 rounded text-lg leading-relaxed">
                        "{scream.message}"
                      </blockquote>
                    )}
                  </div>
                ) : (
                  scream.message && (
                    <blockquote className="border-l-4 border-primary pl-6 italic font-mono text-foreground bg-muted/10 p-6 rounded text-lg leading-relaxed">
                      "{scream.message}"
                    </blockquote>
                  )
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-primary/20">
                <Button
                  onClick={handleLike}
                  variant="ghost"
                  size="lg"
                  className="font-mono hover:text-neon-pink hover:bg-neon-pink/10"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  {scream.likes} likes
                </Button>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
                  <span>rage_level: {Math.floor(Math.random() * 100) + 1}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ScreamPage;