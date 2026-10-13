import { describe, it, expect } from 'vitest';
import {
  createRounds, answerFor, plateCount, shareChoices, storyFor, resultFor, dealMiss, nextPlate, overfull,
} from '../../../games/fair-share/game.js';

describe('fair-share rounds', () => {
  it('shares, then takes parts, then fills plates, always dividing evenly within ten', () => {
    const bad = [];
    for (let run = 0; run < 300; run++) {
      const rounds = createRounds();
      const check = (ok, why) => { if (!ok) bad.push({ why, rounds }); };
      check(rounds.map(r => r.kind).join() === 'share,share,part,part,group,group', 'wrong stages');
      check(rounds.every(r => Number.isInteger(answerFor(r)) && answerFor(r) >= 2), 'not an even share of at least 2');
      check(rounds.every(r => r.total <= 10), 'more than ten cookies');
      check(rounds.filter(r => r.kind !== 'group').every(r => answerFor(r) <= 5), 'more than five on a plate');
      check(rounds.filter(r => r.kind === 'group').every(r => answerFor(r) <= plateCount(r)), 'not enough plates');
      // The first plate round is the first exercise again, with the other meaning.
      check(rounds[4].total === rounds[0].total && rounds[4].by === rounds[0].by, 'plates do not repeat the first exercise');
      check(rounds[0].tip && rounds[4].tip && rounds.filter(r => r.tip).length === 2, 'tips not on the first deal of each way');
    }
    expect(bad).toEqual([]);
  });

  it('offers four sorted choices with the divisor as the telling mistake', () => {
    const bad = [];
    for (let run = 0; run < 100; run++) {
      for (const round of createRounds()) {
        const choices = shareChoices(round);
        const check = (ok, why) => { if (!ok) bad.push({ why, round, choices }); };
        check(choices.length === 4 && new Set(choices).size === 4, 'not four different choices');
        check(choices.includes(answerFor(round)), 'answer missing');
        check(choices.includes(round.by), 'divisor missing');
        check(choices.join() === [...choices].sort((a, b) => a - b).join(), 'not sorted');
        check(choices.every(v => v >= 1 && v <= (round.kind === 'group' ? plateCount(round) : 9)), 'out of range');
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('fair-share story', () => {
  it('builds the division with the story, with the dealing as its second step', () => {
    const beats = storyFor({ kind: 'share', total: 6, by: 2 });
    expect(beats.map(b => b.equation)).toEqual(['6', '6 : 2', '6 : 2 = ?']);
    expect(beats.map(b => b.scene)).toEqual(['start', 'change', 'question']);
    expect(beats.map(b => b.text)).toEqual([
      'לְסָבְתָא יֵשׁ 6 עוּגִיּוֹת.', 'נוֹעָה וְדָנִי מְקַבְּלִים אוֹתָן בְּשָׁוֶה.', 'כַּמָּה עוּגִיּוֹת קִבֵּל כָּל אֶחָד?',
    ]);
    expect(beats[0].say).toBe('לְסָבְתָא יֵשׁ שֵׁשׁ עוּגִיּוֹת.');
    expect(storyFor({ kind: 'share', total: 9, by: 3 })[1].say).toBe('שְׁלוֹשָׁה יְלָדִים מְקַבְּלִים אוֹתָן בְּשָׁוֶה.');
  });

  it('names the part and what it is a part of', () => {
    expect(storyFor({ kind: 'part', total: 8, by: 2 }).map(b => b.text).slice(1)).toEqual([
      'חֲצִי לְנוֹעָה, וַחֲצִי לְדָנִי.', 'כַּמָּה זֶה חֲצִי מִתּוֹךְ 8 עוּגִיּוֹת?',
    ]);
    expect(storyFor({ kind: 'part', total: 9, by: 3 })[1].text).toBe('3 יְלָדִים, וְכָל אֶחָד מְקַבֵּל שְׁלִישׁ.');
    expect(resultFor({ kind: 'part', total: 8, by: 4 })).toEqual({
      text: 'רֶבַע מִתּוֹךְ 8 עוּגִיּוֹת זֶה 2 עוּגִיּוֹת.', say: 'רֶבַע מִתּוֹךְ שְׁמוֹנֶה עוּגִיּוֹת זֶה שְׁתֵּי עוּגִיּוֹת.',
    });
  });

  it('tells the plates story with the same exercise', () => {
    const beats = storyFor({ kind: 'group', total: 6, by: 2 });
    expect(beats.map(b => b.equation)).toEqual(['6', '6 : 2', '6 : 2 = ?']);
    expect(beats[1].say).toBe('הִיא שָׂמָה שְׁתֵּי עוּגִיּוֹת בְּכָל צַלַּחַת.');
    expect(resultFor({ kind: 'group', total: 6, by: 2 }).say).toBe('הִיא מִלְּאָה שָׁלוֹשׁ צַלָּחוֹת.');
    expect(resultFor({ kind: 'share', total: 6, by: 2 }).text).toBe('כָּל אֶחָד קִבֵּל 3 עוּגִיּוֹת.');
  });
});

describe('fair-share dealing', () => {
  it('accepts equal plates, and says who got what when they are not equal', () => {
    const share = { kind: 'share', total: 6, by: 2 };
    expect(dealMiss(share, [3, 3])).toBeNull();
    expect(dealMiss(share, [4, 2])).toEqual({
      text: 'לְנוֹעָה 4 וּלְדָנִי 2. זֶה לֹא שָׁוֶה.', say: 'לְנוֹעָה אַרְבַּע וּלְדָנִי שְׁתַּיִם. זֶה לֹא שָׁוֶה.',
    });
    expect(dealMiss({ kind: 'part', total: 9, by: 3 }, [3, 4, 2]).text).toBe('לֹא לְכֻלָּם יֵשׁ אוֹתוֹ מִסְפָּר. זֶה לֹא שָׁוֶה.');
  });

  it('fills plates with exactly the number asked, leaving the rest empty', () => {
    const group = { kind: 'group', total: 6, by: 2 };
    expect(dealMiss(group, [2, 0, 2, 2])).toBeNull();
    expect(dealMiss(group, [2, 2, 1, 1]).text).toBe('בְּכָל צַלַּחַת צְרִיכוֹת לִהְיוֹת 2 עוּגִיּוֹת.');
    expect(overfull(group).say).toBe('בְּכָל צַלַּחַת שְׁתֵּי עוּגִיּוֹת, לֹא יוֹתֵר.');
  });

  it('points to the plate to fill next', () => {
    expect(nextPlate({ kind: 'share', total: 6, by: 3 }, [1, 0, 1])).toBe(1);
    expect(nextPlate({ kind: 'share', total: 6, by: 2 }, [2, 2])).toBe(0);
    expect(nextPlate({ kind: 'group', total: 6, by: 2 }, [2, 0, 1, 0])).toBe(2);
    expect(nextPlate({ kind: 'group', total: 6, by: 2 }, [2, 0, 2, 0])).toBe(1);
  });
});
