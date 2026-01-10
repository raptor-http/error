type Environment = "development" | "production";

/**
 * Options which can be used to change error handling functionality.
 */
export interface ErrorHandlerOptions {
  /**
   * Whether the system should render in development or production.
   */
  env?: Environment;
}
