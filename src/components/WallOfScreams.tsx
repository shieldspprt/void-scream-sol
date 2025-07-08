import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Heart, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  if (loading) {
    return <div className="text-center font-mono text-neon-green">Loading screams...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot bg-primary"></div>
          <div className="terminal-dot bg-secondary"></div>
          <div className="terminal-dot bg-accent"></div>
          <span className="text-sm font-mono ml-2">wall_of_screams.dat</span>
        </div>
        <CardHeader>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold font-mono glitch" data-text="WALL OF SCREAMS">
              WALL OF SCREAMS
            </h2>
            <p className="text-muted-foreground font-mono">
              &gt; anonymous_rage_collection.exe
            </p>
            <div className="flex justify-center gap-4 text-sm font-mono">
              <span className="text-neon-green">{screams.length} total screams</span>
              <span className="text-neon-cyan">{screams.reduce((sum, s) => sum + s.likes, 0)} total likes</span>
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
                <Button
                  onClick={() => handleLike(scream.id)}
                  variant="ghost"
                  size="sm"
                  className="font-mono hover:text-neon-pink hover:bg-neon-pink/10"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {scream.likes}
                </Button>
                
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

      {/* Load More */}
      {screams.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="btn-neon font-mono" onClick={fetchScreams}>
            &gt; refresh_screams()
          </Button>
        </div>
      )}
    </div>
  );
};