import type { ErrorHandler } from "@raptor/framework";

import Handler from "./error-handler.ts";

const handler = new Handler();

/**
 * A convenient helper function for the error handler package.
 */
export default handler.handle as ErrorHandler;
