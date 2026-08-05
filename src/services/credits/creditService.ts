export type CreditBalance = {
  remainingCredits: number;
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

let remainingCredits = 120;

export const creditService = {
  async deductCredits(amount: number): Promise<CreditBalance> {
    await wait(120);
    remainingCredits = Math.max(0, remainingCredits - amount);
    return { remainingCredits };
  },

  async refundCredits(amount: number): Promise<CreditBalance> {
    await wait(120);
    remainingCredits += amount;
    return { remainingCredits };
  },

  async getRemainingCredits(): Promise<CreditBalance> {
    await wait(80);
    return { remainingCredits };
  },
};
