# הוספת משחק ל-AlefBet

## גבולות האחריות

המשחק מחזיק תוכן, חוקים, רמזים, רמת קושי ורינדור. התשתית מספקת מעטפת,
קלט, משוב, מחזור חיים ושמירת תוצאות. הוספת משחק רגיל משנה רק את תיקיית
המשחק ואת הקטלוג; הבנייה מעדכנת אוטומטית את רשימת נכסי האופליין.
רכיב חדש מחלצים כשיש לפחות שני משתמשים עם אותה התנהגות.

## התחלה מהירה

`npm run new:game -- my-game "שם המשחק"` יוצר שלושה קבצים ורושם בקטלוג.
מפעילים `node start.js` ופותחים `/games/my-game/`. התבנית היא משחק בחירה
עובד, שאפשר להחליף את תוכנו או את כל `buildRound` שלו.

`common.js` הוא API כללי. `runtime.js` נשאר כניסה תואמת למשחקי עברית.
לשניהם משתמשים ב-`runtime.css`. משחק ללא דיבור מגדיר `audio: false`;
צלילי הצלחה עדיין זמינים דרך `sounds` ו-`createFeedback`. זו הפרדת JavaScript; הסגנון המשותף עדיין
כולל גם רכיבי עברית. נקדן ועורך אינם נטענים בכניסה למשחק חשבון.

## שלוש אפשרויות להרכבה

1. בחירת תשובה: `runGame` עם `createChoiceRound` (השלמה לעשר).
2. סיבוב עם ממשק ייחודי: `runGame` עם `buildRound` מקומי (ציר המספרים).
3. פעילות חופשית: `bootstrapGame` ללא מנהל סיבובים, לדוגמה:

```js
import { bootstrapGame, createRoundScope } from '../../framework/dist/common.js';

export async function startGame(container) {
  const result = await bootstrapGame(container, {
    gameId: 'explore', title: 'חוקרים מספרים', audio: false,
  });
  if (result.aborted) return result;
  const { shell } = result;
  const scope = createRoundScope();
  shell.on('end', () => scope.dispose());
  const button = document.createElement('button');
  button.textContent = 'הוספת קובייה';
  shell.bodyEl.append(button);
  scope.listen(button, 'click', () => { /* חוקי הפעילות כאן */ });
  return result;
}
```

## מחזור חיים וקלט

בכל סיבוב רושמים רכיבים עם `scope.use`, מאזינים עם `scope.listen` וטיימרים
עם `scope.schedule`. פעולות אסינכרוניות מקבלות `scope.signal` אם הן תומכות
בביטול; אחרי `await` בודקים `isActive()` לפני שינוי מצב. פעולות ארוכות בלי
יכולת ביטול אינן נחסמות אוטומטית על ידי התשתית.

`onCorrect` ו-`onWrong` מנהלים נעילה, ניקוד ומעבר. בממשק מותאם משתמשים
ב-`isAnswered()` וב-`subscribeAnswered` כדי למנוע תשובות כפולות. אל תנהלו
מונה ניקוד נוסף במשחק. אתחול באותו מיכל מסיים את המשחק הקודם.

גרירה משתמשת ב-`createDragSource` וב-`createDropTarget`, הרשומים ב-scope.
המשחק קובע אם ההנחה נכונה. ספקו גם חלופת לחיצה/מקלדת; ראו `nikud-match`.
כפתורים בגודל 64 פיקסלים לפחות. במשוואות ובציר מספרים הגדירו `dir="ltr"`
בתוך העמוד העברי כדי שסדר המספרים והפעולות יישאר נכון.

## בדיקות והפצה

הוסיפו בדיקת דפדפן לתשובה נכונה, ניסיון נוסף, סיום והפעלה מחדש. לאינטראקציה
חדשה בדקו גם מגע ומקלדת. משחק חדש צריך לעבוד בכתובת הישירה ובמצב אופליין
אחרי התקנת המטמון. הוסיפו בדיקות ליצירת התרגילים אם יש בהן לוגיקה לא פשוטה.

מריצים `npm run verify`. הפקודה בונה מחדש ובודקת הכול; מחייבים גם dist.
לבדיקת המשחק בלבד: `npm run e2e -- e2e/math.spec.js` (כולל בנייה אוטומטית).
התקנת דפדפנים ראשונית: `npm run setup:browsers`.
הבנייה שומרת את שתי כניסות ה-runtime ואת תלויותיהן במטמון המשותף; זו אינה
התקנה נפרדת לכל משחק. בדיקת דפדפן אוטומטית אינה מחליפה בדיקת שמע בטלפון אמיתי.

### בדיקות אופליין

ייבאו `test` מתוך `e2e/network-server.js` והשתמשו בשרת המבודד של הבדיקה:

```js
await page.goto(`${network.url}/games/my-game/`);
await page.evaluate(() => navigator.serviceWorker.ready);
await network.offline(page);
await page.reload(); // כאן בודקים שהמשחק עובד מהמטמון
await network.online(page);
```

העזר מנהל ניתוק שרת אמיתי, התאמה ל-WebKit, אימות החיבור וניקוי אוטומטי.
אין להעתיק `setOffline`, בדיקות חיבור או ניהול sockets לתוך spec.
בקשה תקועה אינה הוכחה לניתוק: העזר דורש שגיאת רשת מפורשת בניתוק,
ותשובה חדשה ומאומתת בחיבור. לכל ניסיון יש מגבלת זמן, כולל קריאת גוף התשובה.
בדיקות עם תוכן שרת ייעודי יכולות להגדיר `network.respondWith((req, res) => ...)`.
