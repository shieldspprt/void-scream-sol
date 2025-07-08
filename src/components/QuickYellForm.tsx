import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { useYellSubmission } from '@/hooks/useYellSubmission';
import { YELL_TAGS, AI_SCREAMS, MAX_MESSAGE_LENGTH } from '@/config/constants';
import { SuccessScreen } from './SuccessScreen';

export const QuickYellForm = () => {
  const { submitYell, isSubmitting } = useYellSubmission();
  const [message, setMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTransactionSignature, setLastTransactionSignature] = useState('');

  const generateAiScream = () => {
    const randomScream = AI_SCREAMS[Math.floor(Math.random() * AI_SCREAMS.length)];
    setMessage(randomScream);
  };

  const handleQuickYell = async () => {
    if (!message.trim() || !selectedTag) return;

    const result = await submitYell('post', {
      message,
      exType: selectedTag,
      audioBlob: null
    });

    if (result.success && result.transactionSignature) {
      setLastTransactionSignature(result.transactionSignature);
      setShowSuccess(true);
      setMessage('');
      setSelectedTag('');
    }
  };

  const closeSuccess = () => {
    setShowSuccess(false);
    setLastTransactionSignature('');
  };

  if (showSuccess && lastTransactionSignature) {
    return (
      <SuccessScreen 
        transactionSignature={lastTransactionSignature}
        onClose={closeSuccess}
      />
    );
  }

  return (
    <Card className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-dot bg-destructive"></div>
        <div className="terminal-dot bg-secondary"></div>
        <div className="terminal-dot bg-primary"></div>
        <span className="text-sm font-mono ml-2">quick_yell_v2.0</span>
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-mono text-center">
          <span className="glitch" data-text="LET IT OUT 👹">
            LET IT OUT 👹
          </span>
        </CardTitle>
        <p className="text-center text-muted-foreground font-mono text-sm">
          &gt; Express your rage • Pay 0.01 SOL • Immortalize forever
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tag Selector */}
        <div className="space-y-3">
          <label className="text-sm font-mono text-neon-green font-bold">
            &gt; PICK_YOUR_POISON:
          </label>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="terminal-window font-mono h-12 border-2 border-primary/30 hover:border-primary">
              <SelectValue placeholder="What type of disaster? (Required)" />
            </SelectTrigger>
            <SelectContent className="terminal-window border-primary border-2">
              {YELL_TAGS.map((tag) => (
                <SelectItem 
                  key={tag} 
                  value={tag} 
                  className="font-mono hover:bg-primary/20 py-3 cursor-pointer"
                >
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-mono text-neon-green font-bold">
              &gt; SCREAM_HERE:
            </label>
            <Button
              onClick={generateAiScream}
              variant="outline"
              size="sm"
              className="btn-glitch h-8 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI Rage
            </Button>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your rage here... They'll never see this coming 😈"
            className="min-h-24 terminal-window font-mono text-foreground bg-input border-primary/30 focus:border-primary resize-none"
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <div className="text-right text-xs text-muted-foreground font-mono">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>

        {/* Selected Tag Display */}
        {selectedTag && (
          <div className="text-center">
            <Badge variant="outline" className="terminal-window text-neon-pink border-neon-pink font-mono">
              Target: {selectedTag}
            </Badge>
          </div>
        )}

        {/* Yell Button */}
        <Button
          onClick={handleQuickYell}
          disabled={isSubmitting || !message.trim() || !selectedTag}
          className="w-full h-16 text-xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/70 ring-4 ring-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-6 w-6 mr-3 animate-spin" />
              Screaming On-Chain...
            </>
          ) : (
            <>
              🔥 YELL FOR 0.01 SOL 🔥
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground font-mono">
          Your yell will be posted anonymously to the Wall of Screams
        </p>
      </CardContent>
    </Card>
  );
};