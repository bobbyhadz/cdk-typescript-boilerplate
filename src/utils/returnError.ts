import {generateResponse} from './generate-response';

export function returnError({
  statusCode = 400,
  err,
}: {
  statusCode: number;
  err: Error | string;
}): ReturnType<typeof generateResponse> {
  if (err instanceof Error) {
    return generateResponse({
      statusCode,
      body: {error: err.message},
    });
  }
  return generateResponse({
    statusCode,
    body: {error: err},
  });
}
