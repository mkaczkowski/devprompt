import type { LucideIcon } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface ViewModeOption<T extends string> {
  value: T;
  icon: LucideIcon;
  label: string;
}

export interface ViewModeToggleProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: ViewModeOption<T>[];
}

/**
 * A reusable toggle component for switching between view modes.
 * Renders icon-based tabs with tooltips for accessibility.
 */
export function ViewModeToggle<T extends string>({ value, onValueChange, options }: ViewModeToggleProps<T>) {
  const handleValueChange = (newValue: string) => {
    if (options.some((opt) => opt.value === newValue)) {
      onValueChange(newValue as T);
    }
  };

  return (
    <Tabs value={value} onValueChange={handleValueChange}>
      <TabsList variant="minimal" size="none">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <TabsTrigger key={option.value} value={option.value} aria-label={option.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center justify-center">
                    <Icon className="size-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{option.label}</TooltipContent>
              </Tooltip>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
