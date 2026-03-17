"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/design-system/components/ui/alert-dialog";
import { Badge } from "@repo/design-system/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { KeyIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createApiKey, deleteApiKey } from "@/app/actions/api-keys";

interface ApiKeyItem {
  createdAt: Date;
  createdBy: string;
  expiresAt: Date | null;
  id: string;
  keyPrefix: string | null;
  lastUsedAt: Date | null;
  maskedKey: string;
  name: string;
  service: string;
  updatedAt: Date;
}

function serviceBadgeVariant(
  service: string
): "default" | "secondary" | "outline" {
  switch (service) {
    case "anthropic":
    case "openai":
      return "default";
    case "github":
    case "linear":
      return "secondary";
    default:
      return "outline";
  }
}

export function ApiKeysClient({ initialKeys }: { initialKeys: ApiKeyItem[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createApiKey(formData);
      setDialogOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteApiKey(id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">API Keys</h3>
            <p className="mt-1 text-muted-foreground text-sm">
              Manage external service API keys (Linear, GitHub, etc.) for your
              Symphony instances.
            </p>
          </div>
          <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="h-4 w-4" />
                Add Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add API Key</DialogTitle>
                <DialogDescription>
                  Store an encrypted API key for an external service.
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreate}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Production Linear Key"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="service">Service</Label>
                    <Select name="service" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="key">API Key</Label>
                    <Input
                      id="key"
                      name="key"
                      placeholder="sk-..."
                      required
                      type="password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={isPending} type="submit">
                    {isPending ? "Creating..." : "Create Key"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {initialKeys.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-card-foreground shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <KeyIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">No API keys</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Add API keys for external services your agents need to access.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <Badge variant={serviceBadgeVariant(key.service)}>
                      {key.service}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm">
                    {key.maskedKey}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={isPending}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <TrashIcon className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{key.name}"? This
                            action cannot be undone. Agents using this key will
                            lose access to the service.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(key.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
