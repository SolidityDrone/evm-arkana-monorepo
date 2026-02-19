'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  onPointerDownOutside?: (event: React.PointerEvent) => void;
}

const Dialog = ({ open, onOpenChange, children, onPointerDownOutside }: DialogProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open || !mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent | React.PointerEvent) => {
    // Only close if clicking directly on the backdrop (not on dialog content)
    if (e.target === e.currentTarget) {
      if (onPointerDownOutside) {
        onPointerDownOutside(e as React.PointerEvent);
      } else {
        onOpenChange?.(false);
      }
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-x-hidden"
      onClick={handleBackdropClick}
      onPointerDown={handleBackdropClick}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        margin: 0,
        padding: '1rem',
        maxWidth: '100vw',
        overflowX: 'hidden',
        width: '100vw',
        pointerEvents: 'auto',
      }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        style={{ zIndex: 9999 }}
      />
      
      {/* Dialog content wrapper - centered using flexbox */}
      <div
        className="relative min-w-0"
        style={{ zIndex: 10000, pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onPointerDownOutside?: (event: React.PointerEvent) => void;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onPointerDownOutside, ...props }, ref) => {
    // Filter out onPointerDownOutside from props to prevent it from being spread onto the div
    // This prop is handled by the Dialog component's backdrop click handler
    // We destructure it here so it doesn't get passed to the div element
    return (
      <div
        ref={ref}
        className={cn(
          'relative min-w-0 p-6',
          'bg-card/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.1)',
          ...props.style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogContent.displayName = 'DialogContent';

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogHeader = ({ className, children, ...props }: DialogHeaderProps) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
      >
        {children}
      </h2>
    );
  }
);
DialogTitle.displayName = 'DialogTitle';

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
DialogDescription.displayName = 'DialogDescription';

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };


