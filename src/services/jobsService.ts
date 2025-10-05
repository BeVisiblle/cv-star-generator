// Stub service
export type JobPosting = any;

export class JobsService {
  async listCompanyJobs() { return []; }
  static async getJobs() { return []; }
  static async getJobById() { return null; }
  static async getPublicJobs() { return []; }
  static async getCompanyJobs() { return []; }
  static async createJob() { return null; }
  static async updateJob() { return null; }
  static async deleteJob() {}
}

export const getJobs = async () => [];
export const getJobById = async () => null;
export const getPublicJobs = async () => [];
export const getCompanyJobs = async () => [];
export const createJob = async () => null;
export const updateJob = async () => null;
export const deleteJob = async () => {};
