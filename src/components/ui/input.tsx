import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'rounded-lg border px-2.5 text-base md:text-sm outline-none w-full min-w-0 placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-input/50 dark:disabled:bg-input/80 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:ring-[3px] file:text-sm file:font-medium file:text-foreground file:inline-flex file:border-0 file:bg-transparent',
  {
    variants: {
      variant: {
        default:
          'border-input bg-transparent dark:bg-input/30 shadow-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-1',
        subtle:
          'border-border/30 bg-gradient-to-r from-muted/30 to-muted/10 shadow-none transition-[border-color,box-shadow] duration-200 hover:border-border/50 focus-visible:ring-[0.5px] focus-visible:ring-ring focus-visible:ring-inset',
      },
      inputSize: {
        default: 'h-8 py-1 file:h-6',
        touch: 'h-11 py-2 file:h-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  },
);

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'>, VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, inputSize, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={inputSize}
      className={cn(inputVariants({ variant, inputSize }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
