/**
 * Short praise after a correct answer. Every phrase speaks to the child
 * without gender, and none of them is about the child ("you are smart").
 */
export const PRAISE = [
  'כָּל הַכָּבוֹד',
  'מְצֻיָּן',
  'יֹפִי',
  'נֶהְדָּר',
  'וָאוּ',
  'אֵיזֶה כֵּיף',
];

/** @returns {string} one phrase, with the exclamation mark where Hebrew puts it */
export const randomPraise = () => `${PRAISE[Math.floor(Math.random() * PRAISE.length)]}!`;
