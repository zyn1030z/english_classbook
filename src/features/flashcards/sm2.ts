export interface ReviewSchedule {
 easeFactor: number;
 interval: number;
 repetitions: number;
 nextReview: Date;
}

export function calculateNextReview(
 easeFactor: number,
 interval: number,
 repetitions: number,
 quality: 0 | 1 | 2 | 3 | 4 | 5
): ReviewSchedule {
 const normalizedEase = Math.max(1.3, easeFactor);
 const nextEase = Math.max(
 1.3,
 normalizedEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
 );

 if (quality < 3) {
 return {
 easeFactor: nextEase,
 interval: 1,
 repetitions: 0,
 nextReview: addDays(new Date(), 1)
 };
 }

 const nextRepetitions = repetitions + 1;
 let nextInterval = 1;

 if (nextRepetitions === 1) {
 nextInterval = 1;
 } else if (nextRepetitions === 2) {
 nextInterval = 6;
 } else {
 nextInterval = Math.round(interval * nextEase);
 }

 return {
 easeFactor: Number(nextEase.toFixed(2)),
 interval: nextInterval,
 repetitions: nextRepetitions,
 nextReview: addDays(new Date(), nextInterval)
 };
}

function addDays(date: Date, days: number) {
 const next = new Date(date);
 next.setDate(next.getDate() + days);
 return next;
}
