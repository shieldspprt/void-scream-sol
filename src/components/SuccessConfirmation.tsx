import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Share2, RefreshCw, ExternalLink } from 'lucide-react';

interface SuccessConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onYellAgain: () => void;
}

export const SuccessConfirmation = ({ isOpen, onClose, onYellAgain }: SuccessConfirmationProps) => {
  const handleShare = () => {
    const shareText = "Someone just screamed into the void at YELLEX 🔥 Check out the chaos!";
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: "YELLEX - Scream Into The Void",
        text: shareText,
        url: shareUrl
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    }
  };

  const handleYellAgain = () => {
    onYellAgain();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="terminal-window border-neon-green border-2 glow-neon max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-mono">
            <div className="space-y-4">
              {/* Big Bold Confirmation */}
              <div className="text-center">
                <div className="text-4xl mb-2">🔥</div>
                <h2 className="text-2xl font-black text-neon-green glitch" data-text="YOUR SCREAM IS LIVE!">
                  YOUR SCREAM IS LIVE!
                </h2>
                <div className="text-4xl mt-2">🚨</div>
              </div>
              
              {/* Status Badge */}
              <Badge variant="outline" className="mx-auto border-neon-cyan text-neon-cyan animate-pulse">
                🌊 STREAMING TO THE VOID
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Social Share Callout */}
          <div className="text-center p-4 terminal-window border border-neon-pink/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Share2 className="h-4 w-4 text-neon-pink" />
              <span className="text-sm font-mono text-neon-pink font-bold">REVENGE MODE</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mb-3">
              Send this chaos to your ex anonymously
            </p>
            <Button
              onClick={handleShare}
              variant="secondary"
              size="sm"
              className="btn-glitch text-xs h-8 bg-primary text-primary-foreground border-2 border-primary opacity-100"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Share The Pain
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleYellAgain}
              className="btn-neon h-12 flex flex-col gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs font-mono">YELL AGAIN</span>
            </Button>
            
            <Button
              onClick={onClose}
              variant="secondary"
              className="btn-glitch h-12 flex flex-col gap-1 bg-primary text-primary-foreground border-2 border-primary opacity-100"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs font-mono">VIEW WALL</span>
            </Button>
          </div>

          {/* Fun Stats */}
          <div className="text-center text-xs font-mono text-muted-foreground space-y-1">
            <div className="animate-pulse">💀 Your rage has been immortalized</div>
            <div>🔗 Powered by Solana blockchain</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};