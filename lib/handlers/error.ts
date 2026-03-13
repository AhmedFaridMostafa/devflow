import { NextResponse } from "next/server";
import { ZodError, flattenError } from "zod";

import { RequestError, ValidationError } from "../http-errors";
import logger from "../logger";

export type ResponseType = "api" | "server";

export const getZodFieldErrors = (
  error: ZodError,
): Record<string, string[]> => {
  const { fieldErrors, formErrors } = flattenError(error);
  return {
    ...(fieldErrors as Record<string, string[]>),
    ...(formErrors.length > 0 && { _form: formErrors }),
  };
};

const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]>,
): NextResponse | ErrorResponse => {
  const responseContent = {
    success: false as const,
    status,
    error: {
      message,
      ...(errors && { details: errors }),
    },
  };

  return responseType === "api"
    ? NextResponse.json(responseContent, { status })
    : responseContent;
};

function handleError(error: unknown, responseType: "api"): NextResponse;
function handleError(error: unknown, responseType?: "server"): ErrorResponse;
function handleError(
  error: unknown,
  responseType: ResponseType = "server",
): NextResponse | ErrorResponse {
  if (error instanceof RequestError) {
    logger.error(
      { err: error },
      `${responseType.toUpperCase()} Error: ${error.message}`,
    );

    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors,
    );
  }

  if (error instanceof ZodError) {
    const validationError = new ValidationError(getZodFieldErrors(error));

    logger.error(
      { err: error },
      `Validation Error: ${validationError.message}`,
    );

    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors,
    );
  }

  if (error instanceof Error) {
    logger.error({ err: error }, error.message);
    return formatResponse(responseType, 500, "An unexpected error occurred");
  }

  logger.error({ err: error }, "An unexpected error occurred");
  return formatResponse(responseType, 500, "An unexpected error occurred");
}

export default handleError;
