export function generateResponse({
  statusCode,
  body,
}: {
  statusCode: number;
  body: {[key: string]: string} | {[key: string]: string}[];
}): {
  headers: {
    [key: string]: string;
  };
  statusCode: number;
  body: string;
} {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    statusCode,
    body: JSON.stringify(body),
  };
}
