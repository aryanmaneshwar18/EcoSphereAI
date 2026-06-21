import { formatCO2e, formatNumber, formatPercentage, calculateProgress } from "../lib/utils";

describe("Utility Functions", () => {
  describe("formatCO2e", () => {
    it("formats grams correctly", () => {
      expect(formatCO2e(0.5)).toBe("500 g");
      expect(formatCO2e(0.05)).toBe("50 g");
    });

    it("formats kilograms correctly", () => {
      expect(formatCO2e(1.5)).toBe("1.5 kg");
      expect(formatCO2e(150.2)).toBe("150.2 kg");
    });

    it("formats tonnes correctly", () => {
      expect(formatCO2e(1500)).toBe("1.50 t");
      expect(formatCO2e(10000)).toBe("10.00 t");
    });
  });

  describe("formatNumber", () => {
    it("formats numbers with commas", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
    });

    it("formats decimals correctly", () => {
      expect(formatNumber(1000.5, 2)).toBe("1,000.50");
    });
  });

  describe("formatPercentage", () => {
    it("adds positive sign for values > 0", () => {
      expect(formatPercentage(15.2)).toBe("+15.2%");
    });

    it("does not add sign for values <= 0", () => {
      expect(formatPercentage(-5.4)).toBe("-5.4%");
      expect(formatPercentage(0)).toBe("0.0%");
    });
  });

  describe("calculateProgress", () => {
    it("calculates progress correctly", () => {
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(200, 100)).toBe(100); // capped at 100
      expect(calculateProgress(-10, 100)).toBe(0); // floored at 0
    });

    it("handles zero target", () => {
      expect(calculateProgress(50, 0)).toBe(0);
    });
  });
});
