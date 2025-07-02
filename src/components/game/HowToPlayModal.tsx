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
                Find synonyms that follow the pattern - each word shares more starting letters with the next!
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">Find a synonym for each clue word</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">Each answer must start with the same letters as the previous answer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">The first answer can start with any letter</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">The second must start with the same first letter</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2">•</span>
                  <span className="text-xs sm:text-sm">The third must start with the same first two letters, and so on</span>
                </li>
              </ul>
              <div className="mt-4 sm:mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Example:</strong> BICKER → BAMBOOZLE → BARBARIC (B → BA → BAR...)
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