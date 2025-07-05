import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Heart, MessageSquare } from 'lucide-react';

interface Scream {
  id: string;
  message: string;
  exType: string;
  timestamp: string;
  hasAudio: boolean;
  likes: number;
}

// Mock data for the wall of screams
const MOCK_SCREAMS: Scream[] = [
  {
    id: '1',
    message: "You said you were 'building something revolutionary' but all you built was a tower of lies and broken promises! I hope your startup fails faster than your commitment to our relationship!",
    exType: "💸 Crypto Bro",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    hasAudio: false,
    likes: 42
  },
  {
    id: '2',
    message: "[Voice Note] *incoherent screaming about gaslighting*",
    exType: "🌪️ Gaslighter",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    hasAudio: true,
    likes: 137
  },
  {
    id: '3',
    message: "DISAPPEARING FOR WEEKS WITHOUT EXPLANATION IS NOT 'MYSTERIOUS' IT'S JUST RUDE! I hope every notification you get is just spam forever!",
    exType: "👻 Ghoster",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    hasAudio: false,
    likes: 89
  },
  {
    id: '4',
    message: "You were like a walking parade of red flags but I was colorblind to your toxicity! May your WiFi always be slow and your phone battery die at 1%!",
    exType: "🤡 Red Flag Parade",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    hasAudio: false,
    likes: 203
  },
  {
    id: '5',
    message: "[Voice Note] *passionate rant about emotional manipulation*",
    exType: "🧛 Energy Vampire",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    hasAudio: true,
    likes: 156
  }
];

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
  const [screams, setScreams] = useState<Scream[]>(MOCK_SCREAMS);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handleLike = (screamId: string) => {
    setScreams(prev => prev.map(scream => 
      scream.id === screamId 
        ? { ...scream, likes: scream.likes + 1 }
        : scream
    ));
  };

  const playAudio = (screamId: string) => {
    if (playingAudio === screamId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(screamId);
      // Simulate audio playback
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  };

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
        {screams.map((scream, index) => (
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
                  <Badge variant="outline" className="terminal-window text-neon-pink border-neon-pink font-mono">
                    {scream.exType}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTimeAgo(scream.timestamp)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  anonymous_user_{scream.id.padStart(6, '0')}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {scream.hasAudio ? (
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded border border-accent/30">
                    <Button
                      onClick={() => playAudio(scream.id)}
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
                          Play
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
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        {scream.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <blockquote className="border-l-4 border-primary pl-4 italic font-mono text-foreground">
                    "{scream.message}"
                  </blockquote>
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
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="btn-neon font-mono">
          &gt; load_more_screams()
        </Button>
      </div>
    </div>
  );
};