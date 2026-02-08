import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'placeholder:text-muted-foreground flex field-sizing-content w-full rounded-lg border px-2.5 text-base md:text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-input/50 dark:disabled:bg-input/80 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:ring-[3px]',
  {
    variants: {
      variant: {
        default:
          'border-input bg-transparent dark:bg-input/30 shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        subtle:
          'border-border/50 dark:border-border/30 bg-muted dark:bg-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)] transition-[border-color,box-shadow] duration-200 hover:border-border/60 dark:hover:border-border/30 focus-visible:ring-[0.5px] focus-visible:ring-ring focus-visible:ring-inset',
      },
      textareaSize: {
        default: 'min-h-16 py-2',
        touch: 'min-h-[10rem] py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'default',
    },
  },
);

interface TextareaProps extends React.ComponentProps<'textarea'>, VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, textareaSize, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-size={textareaSize}
      className={cn(textareaVariants({ variant, textareaSize }), className)}
      {...props}
    />
  );
}

export { Textarea, textareaVariants, type TextareaProps };
