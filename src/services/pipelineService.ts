// Stub service
export type Pipeline = any;
export type PipelineStage = any;
export type PipelineItem = any;

export class PipelineService {
  async loadPipeline() { return null; }
  async movePipelineItem(...args: any[]) {}
  async addToPipeline(...args: any[]) {}
  static async getPipeline() { return null; }
  static async getDefaultPipeline() { return null; }
  static async movePipelineItem() {}
  static async createPipelineItem() { return null; }
  static async deletePipelineItem() {}
}

export const getPipeline = async () => null;
export const getDefaultPipeline = async () => null;
export const movePipelineItem = async () => {};
export const createPipelineItem = async () => null;
export const deletePipelineItem = async () => {};
