/** The pilot shell's words. Game texts live with each game. */
export const HOME_TITLE = 'מִשְׂחֲקֵי חֶשְׁבּוֹן';
export const HOME_PROMPT = 'בַּחֲרוּ מִשְׂחָק';
export const PROGRESS = 'הִתְקַדְּמוּת';
export const WELL_DONE = 'כָּל הַכָּבוֹד!';
export const REPLAY = 'שַׂחֲקוּ שׁוּב';
export const CHOOSE_GAME = 'בְּחִירַת מִשְׂחָק';

/** @param {number} total @returns {string} */
export const completedText = total => (total === 1 ? 'הִשְׁלַמְתֶּם מְשִׂימָה!' : `הִשְׁלַמְתֶּם ${total} מְשִׂימוֹת!`);
