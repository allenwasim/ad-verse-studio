'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Admin, Lead, Task } from '@/lib/types';
import React, { useState, useTransition, useEffect } from 'react';
import { TaskForm } from './task-form';
import { Checkbox } from '@/components/ui/checkbox';
import { updateTaskStatus } from '@/lib/actions';
import { ClientDate } from '@/app/(dashboard)/leads/client-date';
import { cn } from '@/lib/utils';

interface TaskSheetProps {
  leadId?: string;
  leads: Lead[];
  admins: Admin[];
  tasks: Task[]; // These are the initial tasks for the lead
  children: React.ReactNode;
}

export function TaskSheet({ leadId, leads, admins, tasks, children }: TaskSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [displayTasks, setDisplayTasks] = useState(tasks);

  useEffect(() => {
    if (isOpen) {
      setDisplayTasks(tasks);
    }
  }, [tasks, isOpen]);

  const handleTaskStatusChange = (taskId: string, completed: boolean) => {
    // Optimistic update
    setDisplayTasks(currentTasks =>
      currentTasks.map(t => (t.id === taskId ? { ...t, completed } : t))
    );

    startTransition(async () => {
      await updateTaskStatus(taskId, completed);
    });
  };

  const handleTaskAdded = (newTask: Task) => {
    setDisplayTasks(currentTasks => [newTask, ...currentTasks]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Manage Tasks</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <TaskForm
            admins={admins}
            leads={leads}
            leadId={leadId}
            onSave={handleTaskAdded}
          />

          <div className="space-y-2 pt-4">
            {displayTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={checked => handleTaskStatusChange(task.id, !!checked)}
                    disabled={isPending}
                  />
                  <div>
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        'text-sm font-medium',
                        task.completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </label>
                    <div className='text-xs text-muted-foreground'>
                      Due: <ClientDate date={task.dueDate} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
