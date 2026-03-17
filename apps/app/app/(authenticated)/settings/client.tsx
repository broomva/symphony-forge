"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";

interface Settings {
  billingPlan: string;
  createdAt: Date;
  id: string;
  maxConcurrentAgents: number;
  maxInstances: number;
  organizationId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: Date;
}

function planLabel(plan: string): string {
  switch (plan) {
    case "starter":
      return "Starter";
    case "team":
      return "Team";
    case "enterprise":
      return "Enterprise";
    default:
      return plan;
  }
}

function planBadgeVariant(plan: string): "default" | "secondary" | "outline" {
  switch (plan) {
    case "enterprise":
      return "default";
    case "team":
      return "secondary";
    default:
      return "outline";
  }
}

export function SettingsClient({
  initialSettings,
}: {
  initialSettings: Settings;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateSettings(formData);
      router.refresh();
    });
  }

  return (
    <>
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your organization's billing plan and current limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-sm">Plan</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={planBadgeVariant(initialSettings.billingPlan)}>
                  {planLabel(initialSettings.billingPlan)}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Max Instances</p>
              <p className="mt-1 font-semibold text-lg">
                {initialSettings.maxInstances}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Max Concurrent Agents
              </p>
              <p className="mt-1 font-semibold text-lg">
                {initialSettings.maxConcurrentAgents}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Settings */}
      <Card>
        <form action={handleSubmit}>
          <CardHeader>
            <CardTitle>Update Settings</CardTitle>
            <CardDescription>
              Modify your organization limits and plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="billingPlan">Billing Plan</Label>
                <Select
                  defaultValue={initialSettings.billingPlan}
                  name="billingPlan"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxInstances">Max Instances</Label>
                <Input
                  defaultValue={initialSettings.maxInstances}
                  id="maxInstances"
                  max={50}
                  min={1}
                  name="maxInstances"
                  type="number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxConcurrentAgents">
                  Max Concurrent Agents
                </Label>
                <Input
                  defaultValue={initialSettings.maxConcurrentAgents}
                  id="maxConcurrentAgents"
                  max={100}
                  min={1}
                  name="maxConcurrentAgents"
                  type="number"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Billing Info */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Stripe subscription and customer details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Stripe Customer</p>
              <p className="mt-1 font-mono text-sm">
                {initialSettings.stripeCustomerId ?? "Not connected"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Subscription</p>
              <p className="mt-1 font-mono text-sm">
                {initialSettings.stripeSubscriptionId ??
                  "No active subscription"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
