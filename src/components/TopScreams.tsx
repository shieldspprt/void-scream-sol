import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TopScream {
  id: string;
  message: string | null;
  ex_type: string | null;
  created_at: string;
  likes: number;
}

interface TopScreamsProps {
  refreshTrigger?: number;
}

export const TopScreams = ({ refreshTrigger }: TopScreamsProps) => {
  const [topScreams, setTopScreams] = useState<TopScream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopScreams();
  }, [refreshTrigger]);

  const fetchTopScreams = async () => {
    try {
      const { data, error } = await supabase
        .from('screams')
        .select('id, message, ex_type, created_at, likes')
        .eq('action', 'post')
        .order('likes', { ascending: false })
        .limit(3);

      if (error) throw error;
      setTopScreams(data || []);
    } catch (error) {
      console.error('Error fetching top screams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="terminal-window">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground font-mono text-sm">Loading top screams...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-dot bg-yellow-500"></div>
        <div className="terminal-dot bg-neon-green"></div>
        <div className="terminal-dot bg-neon-cyan"></div>
        <span className="text-sm font-mono ml-2">top_screams.dat</span>
      </div>
      <CardHeader className="pb-3">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-bold font-mono text-neon-green">
              THIS WEEK'S LOUDEST
            </h3>
            <TrendingUp className="h-5 w-5 text-neon-cyan" />
          </div>
          <p className="text-muted-foreground font-mono text-xs">
            &gt; most_liked_rage.exe
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {topScreams.length === 0 ? (
          <p className="text-muted-foreground font-mono text-center text-sm">
            No screams yet... be the first!
          </p>
        ) : (
          topScreams.map((scream, index) => (
            <div key={scream.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`text-lg ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-400' : 
                    'text-orange-500'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  {scream.ex_type && (
                    <Badge variant="outline" className="text-xs font-mono border-neon-pink text-neon-pink">
                      {scream.ex_type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-neon-pink font-mono">
                  <Heart className="h-3 w-3" />
                  {scream.likes}
                </div>
              </div>
              
              {scream.message && (
                <blockquote className="text-xs font-mono text-muted-foreground italic border-l-2 border-primary/30 pl-2 line-clamp-2">
                  "{scream.message}"
                </blockquote>
              )}
              
              {index < topScreams.length - 1 && (
                <div className="h-px bg-primary/20" />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};