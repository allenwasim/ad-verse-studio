'use client';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type AddScreenWrapperProps = {
  onClick: () => void;
};

export function AddScreenWrapper({ onClick }: AddScreenWrapperProps) {
    return (
        <Button size="sm" className="gap-1" onClick={onClick}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Screen
            </span>
        </Button>
    );
}
