import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md mx-auto">
        <DialogClose onClose={onClose} />
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold game-text-primary">
            How to Play Cascade
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm game-text-secondary">
              <p className="text-sm sm:text-base game-text-primary mb-3 sm:mb-4">
                The objective of the game is to complete the cascade by finding synonyms for each clue word
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">The first (n-1) letters of the n'th answer are common with those of the previous answer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">E.g. the first 2 letters of the 3rd answer are common with those of the second answer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">Similary, the first 4 letters of the 5th answer can be derived from the 4th answer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">The corresponding common letters autofill (in the yellow boxes) when you find an answer</span>
                </li>
              </ul>
              <div className="mt-4 sm:mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Example:</strong> Cascade → CRanberry → CRIminal → CRICket (C → CR → CRI...)
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlayModal; 
