import {
  SymphonyAuthError,
  SymphonyConnectionError,
  SymphonyError,
  SymphonyNotFoundError,
  SymphonyTimeoutError,
} from "./errors";
import type {
  ErrorEnvelope,
  IssueDetail,
  RefreshResponse,
  ShutdownResponse,
  StateSummary,
  SymphonyClientConfig,
  WorkspaceEntry,
} from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const TRAILING_SLASHES = /\/+$/;

// ---------------------------------------------------------------------------
// SymphonyClient
// ---------------------------------------------------------------------------

/**
 * Type-safe HTTP client for the Symphony orchestrator engine.
 *
 * Uses native `fetch` so it works in Node.js, Edge, and browser environments.
 * Includes automatic retry with exponential back-off on transient errors
 * (502 / 503 / 504) and request-level timeouts via `AbortController`.
 */
export class SymphonyClient {
  private readonly baseUrl: string;
  private readonly apiToken: string | undefined;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly _fetch: typeof globalThis.fetch;

  constructor(config: SymphonyClientConfig) {
    // Strip trailing slash from baseUrl for consistent path joining
    this.baseUrl = config.baseUrl.replace(TRAILING_SLASHES, "");
    this.apiToken = config.apiToken;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = config.retries ?? DEFAULT_RETRIES;
    this._fetch = config.fetch ?? globalThis.fetch;
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Fetch the full orchestrator state summary. */
  getState(): Promise<StateSummary> {
    return this.request<StateSummary>("GET", "/api/v1/state");
  }

  /** Fetch detail for a single issue by its identifier. */
  getIssue(identifier: string): Promise<IssueDetail> {
    return this.request<IssueDetail>(
      "GET",
      `/api/v1/${encodeURIComponent(identifier)}`
    );
  }

  /** List all known workspaces. */
  getWorkspaces(): Promise<WorkspaceEntry[]> {
    return this.request<WorkspaceEntry[]>("GET", "/api/v1/workspaces");
  }

  /** Trigger a refresh cycle on the engine. */
  triggerRefresh(): Promise<RefreshResponse> {
    return this.request<RefreshResponse>("POST", "/api/v1/refresh");
  }

  /** Request a graceful shutdown of the engine. */
  triggerShutdown(): Promise<ShutdownResponse> {
    return this.request<ShutdownResponse>("POST", "/api/v1/shutdown");
  }

  /** Returns `true` if the engine's health-check endpoint responds with 2xx. */
  isHealthy(): Promise<boolean> {
    return this.probe("/healthz");
  }

  /** Returns `true` if the engine's readiness endpoint responds with 2xx. */
  isReady(): Promise<boolean> {
    return this.probe("/readyz");
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  /**
   * Core request method with retry and timeout logic.
   */
  private async request<T>(method: string, path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      if (attempt > 0) {
        await this.sleep(500 * 2 ** (attempt - 1));
      }

      const result = await this.attemptRequest(method, url);

      if (result.retryable) {
        lastError = result.error;
        continue;
      }

      if (result.error) {
        throw result.error;
      }

      return (await result.response.json()) as T;
    }

    throw lastError instanceof SymphonyError
      ? lastError
      : new SymphonyError("All retry attempts exhausted", "RETRIES_EXHAUSTED");
  }

  /** Single attempt — returns a result indicating success, retryable error, or terminal error. */
  private async attemptRequest(
    method: string,
    url: string
  ): Promise<
    | { response: Response; error?: never; retryable?: never }
    | { response?: never; error: SymphonyError; retryable: boolean }
  > {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers = this.buildHeaders(method);
      const response = await this._fetch(url, {
        method,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (RETRYABLE_STATUS_CODES.has(response.status)) {
        return {
          error: new SymphonyError(
            `HTTP ${response.status}`,
            "TRANSIENT",
            response.status
          ),
          retryable: true,
        };
      }

      const terminalError = await this.checkResponseError(response);
      if (terminalError) {
        return { error: terminalError, retryable: false };
      }

      return { response };
    } catch (error) {
      clearTimeout(timer);
      return this.classifyCatchError(error);
    }
  }

  /** Build request headers. */
  private buildHeaders(method: string): Record<string, string> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (method !== "GET") {
      headers["Content-Type"] = "application/json";
    }
    if (this.apiToken) {
      headers.Authorization = `Bearer ${this.apiToken}`;
    }
    return headers;
  }

  /** Check for error responses and return a typed error or null. */
  private async checkResponseError(
    response: Response
  ): Promise<SymphonyError | null> {
    if (response.status === 401) {
      return new SymphonyAuthError();
    }
    if (response.status === 404) {
      return new SymphonyNotFoundError(response.url);
    }
    if (response.ok) {
      return null;
    }

    let message = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as ErrorEnvelope;
      if (body?.error?.message) {
        message = body.error.message;
      }
    } catch {
      /* not JSON */
    }
    return new SymphonyError(message, "REQUEST_FAILED", response.status);
  }

  /** Classify a caught error as retryable, timeout, or terminal. */
  private classifyCatchError(error: unknown): {
    error: SymphonyError;
    retryable: boolean;
  } {
    if (error instanceof SymphonyError) {
      return { error, retryable: false };
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        error: new SymphonyTimeoutError(this.timeoutMs),
        retryable: false,
      };
    }
    if (error instanceof TypeError) {
      return {
        error: new SymphonyConnectionError(this.baseUrl, error),
        retryable: true,
      };
    }
    return {
      error: new SymphonyError(String(error), "UNKNOWN"),
      retryable: false,
    };
  }

  /**
   * Lightweight probe for health / readiness endpoints.
   * Returns a boolean instead of throwing on non-2xx responses.
   */
  private async probe(path: string): Promise<boolean> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {};
      if (this.apiToken) {
        headers.Authorization = `Bearer ${this.apiToken}`;
      }

      const response = await this._fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);
      return response.ok;
    } catch {
      clearTimeout(timer);
      return false;
    }
  }

  /** Promise-based sleep helper. */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
