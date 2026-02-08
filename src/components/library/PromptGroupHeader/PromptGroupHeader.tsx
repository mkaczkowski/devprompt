import { cn } from '@/lib/utils';

interface PromptGroupHeaderProps {
  label: string;
}

export function PromptGroupHeader({ label }: PromptGroupHeaderProps) {
  return (
    <div className="px-1 pb-2">
      <span className={cn('text-[11px] font-medium tracking-wider uppercase', 'text-muted-foreground')}>{label}</span>
    </div>
  );
}
