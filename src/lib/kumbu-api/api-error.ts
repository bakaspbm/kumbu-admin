export class KumbuApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "KumbuApiError";
  }
}
