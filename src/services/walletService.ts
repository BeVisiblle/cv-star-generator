// Stub service
export type Wallet = any;
export type TokenTransaction = any;

export class WalletService {
  async getWallet() { return { balance: 0 }; }
  async getTransactions(...args: any[]) { return []; }
  async ensureWallet() { return { balance: 0 }; }
  static async getWallet() { return { balance: 0 }; }
  static async getTransactions() { return []; }
  static async addTokens() {}
}

export const getWallet = async () => null;
export const getTransactions = async () => [];
export const addTokens = async () => {};
