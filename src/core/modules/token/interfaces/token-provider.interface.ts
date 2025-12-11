export interface ITokenProvider {
  send(message: string, to: string): Promise<void>;
}
