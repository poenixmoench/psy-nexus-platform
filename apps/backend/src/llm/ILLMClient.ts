export interface ILLMClient {
  modelName: string;
  generate(prompt: string): Promise<string>;
  getTokenCount(text: string): number;
}
