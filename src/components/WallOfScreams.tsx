import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Heart, MessageSquare, Share2, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Scream {
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

export const WallOfScreams = () => {
  const [screams, setScreams] = useState<Scream[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScreams();
  }, []);

  const fetchScreams = async () => {
    try {
      const { data, error } = await supabase
        .from('screams')
        .select('*')
        .eq('action', 'post')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScreams(data || []);
    } catch (error) {
      console.error('Error fetching screams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (screamId: string) => {
    try {
      const scream = screams.find(s => s.id === screamId);
      if (!scream) return;

      const { error } = await supabase
        .from('screams')
        .update({ likes: scream.likes + 1 })
        .eq('id', screamId);

      if (error) throw error;

      setScreams(prev => prev.map(scream => 
        scream.id === screamId 
          ? { ...scream, likes: scream.likes + 1 }
          : scream
      ));
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const playAudio = (screamId: string, audioData: string) => {
    if (playingAudio === screamId) {
      setPlayingAudio(null);
      return;
    }

    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setPlayingAudio(screamId);
      audio.play();
      audio.onended = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  };

  const handleCopyLink = async (screamId: string) => {
    try {
      const link = `${window.location.origin}?scream=${screamId}`;
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copied!",
        description: "Share this scream with the world",
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleShareToX = (scream: Scream) => {
    const text = scream.message || 'Check out this scream from YELLEX';
    const url = `${window.location.origin}?scream=${scream.id}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleShareToLinkedIn = (scream: Scream) => {
    const text = scream.message || 'Check out this scream from YELLEX';
    const url = `${window.location.origin}?scream=${scream.id}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank');
  };

  if (loading) {
    return <div className="text-center font-mono text-neon-green">Loading screams...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <Card className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot bg-primary"></div>
          <div className="terminal-dot bg-secondary"></div>
          <div className="terminal-dot bg-accent"></div>
          <span className="text-sm font-mono ml-2">wall_of_screams.dat</span>
        </div>
        <CardHeader>
          <div className="text-center space-y-3">
            <div className="flex items-center justify-between">
              <div></div>
              <h2 className="text-2xl font-bold font-mono glitch" data-text="WALL OF SCREAMS">
                WALL OF SCREAMS
              </h2>
              <Button 
                onClick={fetchScreams}
                variant="outline" 
                size="sm"
                className="btn-neon font-mono h-8 px-3 text-xs animate-none hover:animate-spin transition-all duration-300"
                disabled={loading}
              >
                🔄 {loading ? 'LOADING' : 'REFRESH'}
              </Button>
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              &gt; anonymous_rage_collection.exe
            </p>
            <div className="flex justify-center gap-4 text-xs font-mono">
              <span className="text-neon-green">{screams.length} screams</span>
              <span className="text-neon-cyan">{screams.reduce((sum, s) => sum + s.likes, 0)} likes</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Screams Feed */}
      <div className="space-y-4">
        {screams.length === 0 ? (
          <Card className="terminal-window">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground font-mono">No screams yet... be the first to unleash your rage!</p>
            </CardContent>
          </Card>
        ) : (
          screams.map((scream, index) => (
          <Card key={scream.id} className="terminal-window relative overflow-hidden">
            {/* Glitch effect overlay for some cards */}
            {index % 3 === 0 && (
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full bg-gradient-to-r from-neon-pink via-transparent to-neon-cyan animate-pulse"></div>
              </div>
            )}
            
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {scream.ex_type && (
                    <Badge variant="outline" className="terminal-window text-neon-pink border-neon-pink font-mono">
                      {scream.ex_type}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTimeAgo(scream.created_at)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  anonymous_user_{scream.id.slice(-6)}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {scream.has_audio && scream.audio_data ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-muted/20 rounded border border-accent/30">
                      <Button
                        onClick={() => playAudio(scream.id, scream.audio_data!)}
                        size="sm"
                        className="btn-glitch"
                      >
                        {playingAudio === scream.id ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Playing...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Play Audio
                          </>
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-neon-cyan" />
                          <div className="h-2 bg-muted rounded-full flex-1 overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300 ${
                                playingAudio === scream.id ? 'w-full' : 'w-0'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {scream.message && (
                      <blockquote className="border-l-4 border-primary pl-4 italic font-mono text-foreground bg-muted/10 p-3 rounded">
                        "{scream.message}"
                      </blockquote>
                    )}
                  </div>
                ) : (
                  scream.message && (
                    <blockquote className="border-l-4 border-primary pl-4 italic font-mono text-foreground bg-muted/10 p-3 rounded leading-relaxed">
                      "{scream.message}"
                    </blockquote>
                  )
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-primary/20">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleLike(scream.id)}
                    variant="ghost"
                    size="sm"
                    className="font-mono hover:text-neon-pink hover:bg-neon-pink/10"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {scream.likes}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleCopyLink(scream.id)}
                      variant="ghost"
                      size="sm"
                      className="font-mono hover:text-neon-cyan hover:bg-neon-cyan/10 px-2"
                      title="Copy link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleShareToX(scream)}
                      variant="ghost"
                      size="sm"
                      className="font-mono hover:text-neon-purple hover:bg-neon-purple/10 px-2"
                      title="Share to X"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleShareToLinkedIn(scream)}
                      variant="ghost"
                      size="sm"
                      className="font-mono hover:text-neon-green hover:bg-neon-green/10 px-2"
                      title="Share to LinkedIn"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <MessageSquare className="h-3 w-3" />
                  <span>rage_level: {Math.floor(Math.random() * 100) + 1}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

    </div>
  );
};