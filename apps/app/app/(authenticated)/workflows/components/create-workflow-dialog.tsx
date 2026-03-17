"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { PlusIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { createWorkflow } from "@/app/actions/workflows";

const DEFAULT_CONTENT = `# WORKFLOW.md
# Define your Symphony agent workflow here.

## Objectives
- Describe the goals for the agent

## Steps
1. Analyze the issue
2. Plan the implementation
3. Execute changes
4. Verify the results
`;

export function CreateWorkflowDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createWorkflow(formData);
      if (result.ok) {
        setOpen(false);
        formRef.current?.reset();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
          <DialogDescription>
            Create a new WORKFLOW.md configuration for your Symphony agents.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" ref={formRef}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Bug Fix Workflow"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="A brief description of the workflow purpose"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              className="min-h-[200px] font-mono text-sm"
              defaultValue={DEFAULT_CONTENT}
              id="content"
              name="content"
              placeholder="# WORKFLOW.md content..."
              required
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
