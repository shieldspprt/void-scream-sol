import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface SuccessScreenProps {
  transactionSignature: string;
  onClose: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ 
  transactionSignature, 
  onClose 
}) => {
  const explorerUrl = `https://explorer.solana.com/tx/${transactionSignature}`;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="terminal-window max-w-md w-full mx-auto animate-scale-in">
        <div className="terminal-header">
          <div className="terminal-dot bg-primary"></div>
          <div className="terminal-dot bg-secondary"></div>
          <div className="terminal-dot bg-accent"></div>
          <span className="text-sm font-mono ml-2">success_protocol.exe</span>
        </div>
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <CheckCircle className="h-16 w-16 text-primary mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold font-mono glitch" data-text="YOU YELLED!">
              YOU YELLED!
            </h2>
            <p className="text-xl font-mono text-neon-pink">
              It's On-Chain Forever 🔥
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              Your rage has been immortalized on the Solana blockchain.
              <br />
              It can never be deleted. Ever.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.open(explorerUrl, '_blank')}
              variant="outline"
              className="btn-neon w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Solana Explorer
            </Button>
            <Button
              onClick={onClose}
              className="btn-glitch w-full"
            >
              Yell Again 👹
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};