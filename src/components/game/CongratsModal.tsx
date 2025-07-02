import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React from 'react';

// Native SVG icons to replace lucide-react
const Share2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

interface CongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  completionTime?: number | null;
  formatTime?: (milliseconds: number) => string;
}

const CongratsModal: React.FC<CongratsModalProps> = ({ 
  isOpen, 
  onClose, 
  onShare,
  completionTime,
  formatTime
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg mx-auto">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 sm:w-18 sm:h-18 game-trophy-background border-2 flex items-center justify-center">
              <TrophyIcon className="w-8 h-8 sm:w-9 sm:h-9 game-text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold game-text-primary text-center mb-2">
            The cascade pattern is complete
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-center space-y-6 px-4">
              <div className="space-y-2">
                <p className="text-base sm:text-lg game-text-primary font-medium">
                  Excellent work! You found all the synonyms.
                </p>
                {completionTime && formatTime && (
                  <p className="text-lg sm:text-xl font-bold game-text-primary">
                    Time: {formatTime(completionTime)}
                  </p>
                )}
              </div>
              
              <div className="space-y-3 pt-2">
                <Button
                  onClick={onShare}
                  className="w-full flex items-center justify-center gap-2 game-share-button px-6 py-3 font-medium border-2 transition-colors"
                >
                  <Share2Icon className="w-4 h-4" />
                  Share Results
                </Button>
              </div>
              
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="game-text-muted text-sm font-normal"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CongratsModal; 