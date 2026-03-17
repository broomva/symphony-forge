// ---------------------------------------------------------------------------
// Typed error classes for the Symphony client
// ---------------------------------------------------------------------------

/**
 * Base error for all Symphony client failures.
 * Every error carries a machine-readable `code` and the upstream HTTP `status`
 * when available.
 */
export class SymphonyError extends Error {
  readonly code: string;
  readonly status: number | undefined;

  constructor(message: string, code: string, status?: number, cause?: unknown) {
    super(message, { cause });
    this.name = "SymphonyError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Thrown when the client cannot reach the Symphony engine at all
 * (DNS failure, connection refused, network timeout at the TCP level, etc.).
 */
export class SymphonyConnectionError extends SymphonyError {
  readonly baseUrl: string;

  constructor(baseUrl: string, cause?: unknown) {
    super(
      `Unable to connect to Symphony engine at ${baseUrl}`,
      "CONNECTION_ERROR",
      undefined,
      cause
    );
    this.name = "SymphonyConnectionError";
    this.baseUrl = baseUrl;
  }
}

/**
 * Thrown when the engine responds with 401 Unauthorized.
 */
export class SymphonyAuthError extends SymphonyError {
  constructor(message = "Authentication failed — check your API token") {
    super(message, "AUTH_ERROR", 401);
    this.name = "SymphonyAuthError";
  }
}

/**
 * Thrown when the engine responds with 404 Not Found for a specific resource.
 */
export class SymphonyNotFoundError extends SymphonyError {
  readonly identifier: string;

  constructor(identifier: string) {
    super(`Resource not found: ${identifier}`, "NOT_FOUND", 404);
    this.name = "SymphonyNotFoundError";
    this.identifier = identifier;
  }
}

/**
 * Thrown when a request exceeds the configured timeout.
 */
export class SymphonyTimeoutError extends SymphonyError {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`, "TIMEOUT", undefined);
    this.name = "SymphonyTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}
