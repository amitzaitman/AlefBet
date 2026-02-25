/**
 * אנימציות CSS לרכיבי המשחק
 * משתמש ב-Web Animations API
 * [נוסף על ידי: letter-match game]
 *
 * סוגים זמינים: shake, bounce, pulse, fadeIn, confetti
 */

const KEYFRAMES = {
  shake: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-8px)' },
    { transform: 'translateX(8px)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(-3px)' },
    { transform: 'translateX(0)' },
  ],
  bounce: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.25)' },
    { transform: 'scale(0.92)' },
    { transform: 'scale(1.08)' },
    { transform: 'scale(1)' },
  ],
  pulse: [
    { transform: 'scale(1)', opacity: '1' },
    { transform: 'scale(1.1)', opacity: '0.8' },
    { transform: 'scale(1)', opacity: '1' },
  ],
  fadeIn: [
    { opacity: '0', transform: 'translateY(12px)' },
    { opacity: '1', transform: 'translateY(0)' },
  ],
  confetti: [
    { transform: 'scale(0) rotate(0deg)', opacity: '0' },
    { transform: 'scale(1.3) rotate(180deg)', opacity: '1' },
    { transform: 'scale(1) rotate(360deg)', opacity: '1' },
  ],
};

const DURATIONS = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700,
};

/**
 * הפעל אנימציה על אלמנט
 * @param {HTMLElement} el - האלמנט
 * @param {'shake'|'bounce'|'pulse'|'fadeIn'|'confetti'} type - סוג האנימציה
 */
export function animate(el, type) {
  if (!el || !KEYFRAMES[type]) return;
  el.animate(KEYFRAMES[type], {
    duration: DURATIONS[type] || 400,
    easing: 'ease-in-out',
    fill: 'none',
  });
}
