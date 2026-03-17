---
title: "[API Name]"
type: api-contract
domain: # auth | database | billing | dashboard | api | symphony-client
phase: # 1 | 2 | 3 | 4 | 5
status: draft
tags:
  - domain/{area}
  - phase/{n}
  - status/draft
  - type/api-contract
---

# [API Name]

> [!context]
> Brief description of this API, who provides it, and who consumes it.

## Base URL

<!-- Protocol, host, port, base path -->

## Authentication

<!-- How are requests authenticated? Headers, tokens, cookies? -->

## Endpoints

### [METHOD] /path

**Description**: What this endpoint does.

**Path Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| | | | |

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| | | | |

**Request Body**:

```typescript
interface RequestBody {
  field: string;
}
```

**Response**: `200 OK`

```typescript
interface Response {
  field: string;
}
```

**Error Responses**:

| Code | Description |
|------|-------------|
| 400 | Validation error |
| 401 | Not authenticated |
| 404 | Not found |

---

### [METHOD] /another-path

<!-- Repeat the endpoint template -->

## Error Format

```typescript
interface ApiError {
  message: string;
  code: string;
  status: number;
}
```

## Rate Limiting

<!-- Rate limit rules, headers, behavior -->

## Versioning

<!-- API versioning strategy -->

## Related

- [[architecture/overview]]
- [[api-contracts/symphony-http-api]]
