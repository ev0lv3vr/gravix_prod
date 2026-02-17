'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface AddActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discipline: string;
  onSubmit: (data: { discipline: string; description: string; priority?: string; due_date?: string }) => Promise<void>;
}

export function AddActionDialog({ open, onOpenChange, discipline, onSubmit }: AddActionDialogProps) {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        discipline,
        description: description.trim(),
        priority: priority || undefined,
        due_date: dueDate || undefined,
      });
      // Reset form on success
      setDescription('');
      setPriority('');
      setDueDate('');
      onOpenChange(false);
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const disciplineLabel =
    discipline === 'D3' ? 'Containment' : discipline === 'D5' ? 'Corrective' : 'Preventive';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0F1A2E] border-[#1F2937] text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Add {disciplineLabel} Action ({discipline})</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-white">Description <span className="text-danger">*</span></Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe the ${disciplineLabel.toLowerCase()} action...`}
              rows={3}
              className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-brand-800 border-[#1F2937] text-white">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P1">P1 — Critical</SelectItem>
                  <SelectItem value="P2">P2 — High</SelectItem>
                  <SelectItem value="P3">P3 — Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-brand-800 border-[#1F2937] text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" className="text-[#94A3B8]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !description.trim()}
              className="bg-accent-500 hover:bg-accent-600 text-white"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Action
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
