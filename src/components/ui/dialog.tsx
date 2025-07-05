import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Simple X icon SVG to replace lucide-react
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const [isDark, setIsDark] = React.useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Check initially
    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 ${isDark ? 'dark' : ''}`}>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      {/* Content Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {children}
      </div>
    </div>,
    document.body
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ className = '', children }) => {
  return (
    <div
      className={`relative z-50 grid w-full max-w-lg gap-4 game-dialog-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ className = '', children }) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`.trim()}>
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ className = '', children }) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`.trim()}>
      {children}
    </h2>
  );
};

const DialogDescription: React.FC<DialogDescriptionProps> = ({ 
  className = '', 
  children, 
  asChild = false 
}) => {
  if (asChild) {
    return <>{children}</>;
  }
  
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`.trim()}>
      {children}
    </p>
  );
};

// Close button component for the dialog
const DialogClose: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 disabled:pointer-events-none game-dialog-close"
    >
      <XIcon className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
};

const DialogFooter: React.FC<DialogFooterProps> = ({ className = '', children }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`.trim()}>
      {children}
    </div>
  );
};

export {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle
};

