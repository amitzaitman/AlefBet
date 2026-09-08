import { createOptionCards } from '../ui/option-cards.js';

/**
 * Choice games supply content, grading and feedback; the round owns input locking.
 * @param {import('./bootstrap.js').RoundContext} context
 * @param {HTMLElement} container
 * @param {{ options: Array<{id: string, text: string, emoji?: string}>, isCorrect: (option: any) => boolean, onCorrect?: (option: any) => void | Promise<void>, onWrong?: (option: any) => void | Promise<void> }} opts
 */
export function createChoiceRound(context, container, opts) {
  const cards = context.scope.use(createOptionCards(container, opts.options, option => {
    if (context.isAnswered()) return;
    if (opts.isCorrect(option)) {
      void context.onCorrect(() => {
        cards.highlight(option.id, 'correct');
        return opts.onCorrect?.(option);
      });
    } else {
      void context.onWrong(() => opts.onWrong?.(option));
    }
  }));
  context.subscribeAnswered(answered => cards.setDisabled(answered));
  // Games can change presentation without accidentally reopening answered cards.
  return { highlight: cards.highlight, clearHighlight: cards.clearHighlight };
}
