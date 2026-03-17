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
import { PlusIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { createInstance } from "@/app/actions/instances";

export function CreateInstanceDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createInstance(formData);
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
          Add Instance
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Symphony Instance</DialogTitle>
          <DialogDescription>
            Connect an existing Symphony engine or provision a new one.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" ref={formRef}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="production-01" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                name="host"
                placeholder="symphony-prod.up.railway.app"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                defaultValue="443"
                id="port"
                max={65_535}
                min={1}
                name="port"
                required
                type="number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token (optional)</Label>
            <Input
              id="apiToken"
              name="apiToken"
              placeholder="Bearer token for engine auth"
              type="password"
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
              {isPending ? "Adding..." : "Add Instance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
