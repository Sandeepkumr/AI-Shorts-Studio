export type CreditBalance = {
  remainingCredits: number;
};

export const creditService = {
  async getRemainingCredits(): Promise<CreditBalance> {
    return {
      remainingCredits: 120,
    };
  },
};
