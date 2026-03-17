---
title: "Webhook Contracts"
type: api-contract
domain: api
phase: 1
status: active
tags:
  - domain/api
  - phase/1
  - status/active
  - type/api-contract
---

# Webhook Contracts

> [!context]
> Symphony Cloud receives webhooks from two external services: Clerk (authentication events) and Stripe (payment events). Both are handled in `apps/api/app/webhooks/`. This document describes the inbound webhook schemas and verification requirements.

## Clerk Webhooks

**Endpoint**: `POST /webhooks/auth`

**Source file**: `apps/api/app/webhooks/auth/route.ts`

### Verification

Clerk uses [Svix](https://www.svix.com/) for webhook delivery. Every request includes three headers for signature verification:

| Header | Description |
|--------|-------------|
| `svix-id` | Unique message ID |
| `svix-timestamp` | Unix timestamp of the message |
| `svix-signature` | HMAC signature for verification |

**Verification flow**:
```typescript
const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);
const event = webhook.verify(body, {
  "svix-id": svixId,
  "svix-timestamp": svixTimestamp,
  "svix-signature": svixSignature,
}) as WebhookEvent;
```

### Event Types

#### user.created

Fired when a new user signs up.

```typescript
interface UserJSON {
  id: string;
  email_addresses: Array<{
    email_address: string;
  }>;
  first_name: string | null;
  last_name: string | null;
  created_at: number;
  image_url: string;
  phone_numbers: Array<{
    phone_number: string;
  }>;
}
```

**Action**: Identify user in PostHog, capture "User Created" event.

#### user.updated

Fired when user profile is updated.

**Payload**: Same `UserJSON` schema as `user.created`.

**Action**: Update user properties in PostHog, capture "User Updated" event.

#### user.deleted

Fired when a user account is deleted.

```typescript
interface DeletedObjectJSON {
  id?: string;
  object: string;
  deleted: boolean;
}
```

**Action**: Mark user as deleted in PostHog, capture "User Deleted" event.

#### organization.created

Fired when a new organization is created.

```typescript
interface OrganizationJSON {
  id: string;
  name: string;
  created_by: string;
  image_url: string;
  slug: string;
}
```

**Action**: Create group in PostHog via `groupIdentify`, capture "Organization Created" event.

#### organization.updated

Fired when organization details change.

**Payload**: Same `OrganizationJSON` schema.

**Action**: Update group properties in PostHog, capture "Organization Updated" event.

#### organizationMembership.created

Fired when a user is added to an organization.

```typescript
interface OrganizationMembershipJSON {
  organization: {
    id: string;
  };
  public_user_data: {
    user_id: string;
  };
  role: string;
}
```

**Action**: Link user to group in PostHog, capture "Organization Member Created" event.

#### organizationMembership.deleted

Fired when a user is removed from an organization.

**Payload**: Same `OrganizationMembershipJSON` schema.

**Action**: Capture "Organization Member Deleted" event (group unlinking is a TODO).

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `CLERK_WEBHOOK_SECRET` | Svix signing secret from Clerk dashboard |

> [!warning]
> If `CLERK_WEBHOOK_SECRET` is not set, the handler returns `{ message: "Not configured", ok: false }` without processing the event.

---

## Stripe Webhooks

**Endpoint**: `POST /webhooks/payments`

**Source file**: `apps/api/app/webhooks/payments/route.ts`

### Verification

Stripe uses its own signature scheme. The `stripe-signature` header contains a timestamp and signature.

**Verification flow**:
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  env.STRIPE_WEBHOOK_SECRET
);
```

### Event Types

#### checkout.session.completed

Fired when a customer completes a checkout session (new subscription).

```typescript
// Stripe.Checkout.Session
{
  customer: string | Stripe.Customer;
  // ... other Stripe session fields
}
```

**Action**:
1. Extract `customerId` from event data
2. Look up Clerk user by matching `privateMetadata.stripeCustomerId`
3. Capture "User Subscribed" event in PostHog

#### subscription_schedule.canceled

Fired when a subscription schedule is canceled.

```typescript
// Stripe.SubscriptionSchedule
{
  customer: string | Stripe.Customer;
  // ... other Stripe schedule fields
}
```

**Action**:
1. Extract `customerId` from event data
2. Look up Clerk user by matching `privateMetadata.stripeCustomerId`
3. Capture "User Unsubscribed" event in PostHog

### User Resolution

> [!important]
> Both Stripe event handlers use the same user resolution pattern: they call `clerk.users.getUserList()` and find the user whose `privateMetadata.stripeCustomerId` matches the Stripe customer ID. This is an O(n) scan over all users. For scale, this should be replaced with a database lookup.

```typescript
const getUserFromCustomerId = async (customerId: string) => {
  const clerk = await clerkClient();
  const users = await clerk.users.getUserList();
  const user = users.data.find(
    (currentUser) => currentUser.privateMetadata.stripeCustomerId === customerId
  );
  return user;
};
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Stripe dashboard |

> [!warning]
> If either `stripe` (client) or `STRIPE_WEBHOOK_SECRET` is not configured, the handler returns `{ message: "Not configured", ok: false }` without processing the event.

---

## Analytics Lifecycle

Both webhook handlers call `analytics?.shutdown()` at the end of processing to flush any pending events to PostHog before the serverless function terminates.

## Testing Webhooks Locally

1. **Clerk**: Use the Clerk dashboard webhook testing tool, or set up an ngrok tunnel
2. **Stripe**: Use `stripe listen --forward-to localhost:3002/webhooks/payments` with the Stripe CLI

See [[architecture/app-api]] for the full API architecture and [[schemas/env-variables]] for all required environment variables.
