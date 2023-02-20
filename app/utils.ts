type DataResponse<T> = { data: T; error?: undefined };
type ErrorResponse = { error: unknown; data?: undefined };
type ParsedErrorResponse = { error: string; data?: undefined };
type Response<T> = DataResponse<T> | ErrorResponse;
type ParsedResponse<T> = DataResponse<T> | ParsedErrorResponse;

export async function safePromise<T, U extends boolean | undefined = true>(
  promise: Promise<T>,
  parseError?: U
): Promise<U extends true ? ParsedResponse<T> : Response<T>>;
export async function safePromise<T>(promise: Promise<T>, parseError = true): Promise<ParsedResponse<T> | Response<T>> {
  try {
    const data = await promise;
    return { data };
  } catch (error) {
    if (error instanceof Error && parseError) {
      const message = error.message;
      return { error: message };
    }
    return { error };
  }
}

export function hasError<T>(
  result: Response<T> | ParsedResponse<T>
): result is typeof result extends Response<T> ? ErrorResponse : ParsedErrorResponse {
  return result.error !== undefined;
}
