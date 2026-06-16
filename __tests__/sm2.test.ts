import { describe, expect, it } from "vitest";
import { calculateNextReview } from "@/features/flashcards/sm2";

describe("calculateNextReview", () => {
  it("resets repetitions when recall fails", () => {
    const result = calculateNextReview(2.5, 6, 3, 2);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("moves a successful first review to one day", () => {
    const result = calculateNextReview(2.5, 0, 0, 4);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  it("uses six days for the second successful review", () => {
    const result = calculateNextReview(2.5, 1, 1, 5);
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
  });
});
