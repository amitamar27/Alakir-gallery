# DEPLOYMENT — Alakir Gallery

מדריך מלא: מהתקנה ועד אתר חי עם סליקה אמיתית.

---

## תוכן עניינים
1. [פתיחת חשבון iCount](#1-פתיחת-חשבון-icount)
2. [יצירת עמוד סליקה](#2-יצירת-עמוד-סליקה)
3. [חיבור לאתר](#3-חיבור-לאתר)
4. [פריסה — Cloudflare Pages (חינם)](#4-פריסה--cloudflare-pages-חינם)
5. [פריסה — VPS עם Node](#5-פריסה--vps-עם-node)
6. [Webhook להזמנות חיות](#6-webhook-להזמנות-חיות)
7. [אבטחה וגיבויים](#7-אבטחה-וגיבויים)
8. [שאלות נפוצות](#8-שאלות-נפוצות)

---

## 1. פתיחת חשבון iCount

1. נכנסים ל-**<https://www.icount.co.il/>**
2. לוחצים "התנסות חינם" — מקבלים 45 ימי ניסיון חינם, אין צורך בכרטיס אשראי
3. ממלאים: שם, טלפון, מייל, סיסמה
4. מאמתים את כתובת המייל
5. בכניסה הראשונה ממלאים פרטי עסק:
   - שם העסק (כפי שמופיע ברשם החברות / מע"מ)
   - מספר עוסק / חברה
   - כתובת
   - סוג העסק (עוסק פטור / עוסק מורשה / חברה בע"מ)
6. אחרי הרישום — עוברים ל"מסוף סליקה":
   - אם יש לך כבר מסוף (Tranzila / CardCom / Pelecard) — אפשר לחבר אותו
   - אם אין — אפשר להזמין מ-iCount את המסוף שלהם (₪199 הקמה + ₪30 חודשי, פתוח תוך 2-3 ימי עסקים אחרי הגשת מסמכים)
7. בדף "פרטי בנק" — מזינים פרטי חשבון בנק לקבלת התשלומים. **כאן הכסף ינחת.**

> 🏦 **טיפ:** עדיף חשבון נפרד לעסק — לא חובה אבל יותר נקי לחשבונאות.

---

## 2. יצירת עמוד סליקה

ב-iCount, "עמוד סליקה" הוא דף תשלום מאובטח שלהם. זה מה שהקונה רואה אחרי שהוא לוחץ "המשך לתשלום" באתר.

1. בתפריט: **"עמודי סליקה" → "צור עמוד סליקה חדש"**
2. ממלאים:
   - **שם הפנימי:** "Alakir Gallery" (לא חשוב מה — לעיניים שלך בלבד)
   - **שם המוצר:** "יצירות אומנות" (זה מה שייכתב על החשבונית כברירת מחדל)
   - **מחיר ברירת מחדל:** 1 ₪ (לא משנה — האתר יחליף את זה דינמית)
   - **שלם בכל סכום:** ✅ סמנו את התיבה הזו! זה מה שמאפשר לאתר לקבוע את הסכום עבור כל הזמנה
   - **סוג מסמך:** חשבונית מס קבלה (אם עוסק מורשה) או קבלה (אם עוסק פטור)
   - **שלח חשבונית בדוא"ל:** ✅
3. בלשונית **"הגדרות מתקדמות"**:
   - **URL להפניה לאחר תשלום מוצלח** ← זה החלק החשוב!
     הזינו: `https://YOUR-DOMAIN.com/gallery.html?paid=ok`
     (החליפו `YOUR-DOMAIN.com` בדומיין האמיתי שלכם)
   - **URL להפניה אחרי כישלון** (אופציונלי): `https://YOUR-DOMAIN.com/gallery.html?paid=failed`
4. **שמור**.
5. אחרי השמירה תקבלו URL כמו: `https://www.icount.co.il/m/UN9P`
   - **ה-`UN9P` הזה — זה הקוד שאנחנו צריכים!** העתיקו אותו.

---

## 3. חיבור לאתר

1. פותחים את **`admin.html`**
2. סיסמה: `alakir2026` (לאחר חיבור — שנו אותה דרך **הגדרות → אבטחה**!)
3. **הגדרות → תשלום וסליקה**:
   - **קוד עמוד סליקה ב-iCount:** מדביקים את הקוד שהעתקתם (לדוגמה: `UN9P`)
   - מכבים את **"מצב הדגמה"**
   - **שמור שינויים**
4. נכנסים ל-`gallery.html`, בוחרים יצירה, לוחצים "המשך לתשלום"
5. עוברים לעמוד iCount → ב-iCount בלשונית "מסוף בדיקה" אפשר לבצע עסקת בדיקה עם כרטיס דמה
6. אחרי תשלום — חוזרים אוטומטית לאתר עם הודעת תודה ✓

---

## 4. פריסה — Cloudflare Pages (חינם)

הגישה הכי פשוטה — אתר חינם לתמיד, HTTPS אוטומטי, CDN גלובלי.

1. נכנסים ל-**<https://pages.cloudflare.com/>** ופותחים חשבון (חינם, ללא כרטיס)
2. **Create a project → Direct Upload**
3. גוררים את כל התיקייה `alakir_v6/` לדף — או מעלים את ה-ZIP אחרי extraction
4. שם הפרויקט: `alakir-gallery` (או מה שתבחרו)
5. **Deploy site** → תוך דקה האתר חי בכתובת `alakir-gallery.pages.dev`

### הוספת דומיין מותאם

1. ב-Cloudflare Pages → **Custom domains → Set up a custom domain**
2. מקלידים את הדומיין שקניתם (למשל `alakir-gallery.com`)
3. Cloudflare ינחה אתכם לעדכן את ה-DNS ברישום הדומיין:
   - אם קניתם ב-Cloudflare Registrar — אוטומטי
   - אם קניתם בנייצ'יפ / GoDaddy — מעתיקים את ה-Nameservers שCloudflare נותן לכם, ומגדירים אותם ברישום
4. תוך 5-30 דקות הדומיין פעיל, עם HTTPS אוטומטי

### עדכוני תוכן במצב הזה

עדכוני מחירים/יצירות מ-`admin.html` נשמרים **בדפדפן שלכם בלבד** (localStorage).
כדי שיופיעו לכל המבקרים:
1. באדמין: **הגדרות → ניהול נתונים → ⬇ הורד JSON**
2. ב-Cloudflare Pages dashboard: **Files → data/gallery-data.json → Replace**
3. או: **Direct Upload** מחדש של התיקייה כולה

> 💡 **טיפ:** רוצים לעדכן הרבה? עברו ל"שרת מלא" (סעיף 5) — שם הסנכרון אוטומטי.

---

## 5. פריסה — VPS עם Node

מתאים אם רוצים סנכרון אוטומטי של שינויים מהאדמין, העלאת תמונות לשרת,
ולוג הזמנות מרכזי.

### 5.1 פתיחת VPS

**אופציה חינמית:** Oracle Cloud Always Free — 4 ליבות, 24GB RAM, חינם לתמיד.
**אופציה משולמת ($6/חודש):** Vultr / DigitalOcean / Hetzner.

ראה מדריך מפורט בתשובה הקודמת או:
- Oracle Cloud Free Tier: <https://www.oracle.com/cloud/free/>
- Vultr: <https://www.vultr.com/>

### 5.2 התקנה על השרת

```bash
# התחברות SSH
ssh root@YOUR-IP

# עדכון + Node 20 + כלים
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs unzip nginx certbot python3-certbot-nginx
npm install -g pm2

# העלאת הקבצים (עם FileZilla או scp)
mkdir -p /var/www/alakir
cd /var/www/alakir
# (מעלים את alakir_v6.zip לכאן)
unzip alakir_v6.zip
mv alakir_v6/* .
mv alakir_v6/.* . 2>/dev/null
rmdir alakir_v6 && rm alakir_v6.zip

# התקנת תלויות + הגדרות
cd /var/www/alakir/server
npm install --omit=dev
cp .env.example .env
nano .env       # ערוך אם רוצים ADMIN_API_TOKEN

# הרצה תמידית עם PM2
pm2 start server.js --name alakir
pm2 save
pm2 startup     # הריץ את הפקודה ש-PM2 ידפיס

# בדיקה
curl http://localhost:3000/api/ping
```

### 5.3 Nginx + HTTPS

```bash
nano /etc/nginx/sites-available/alakir
```

הדבק (החלף `alakir-gallery.com` בדומיין שלך):
```nginx
server {
    listen 80;
    server_name alakir-gallery.com www.alakir-gallery.com;
    client_max_body_size 12M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/alakir /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d alakir-gallery.com -d www.alakir-gallery.com
```

✅ אתר חי ב-HTTPS, האדמין יזהה אוטומטית את השרת ויסתנכרן.

---

## 6. Webhook להזמנות חיות

כדי שכל הזמנה מ-iCount תופיע אוטומטית באדמין → **הזמנות**, מגדירים IPN webhook:

1. ב-iCount: **עמודי סליקה → עריכה → הגדרות מתקדמות → IPN URL**
2. הזינו: `https://YOUR-DOMAIN.com/api/orders`
3. שמור

מעכשיו, כשיש תשלום מוצלח, iCount שולח התראה לשרת שלך, השרת רושם את ההזמנה
בקובץ הנתונים, והאדמין מציג אותה.

> ⚠️ ה-webhook עובד רק אם יש לך שרת Node פעיל (סעיף 5). במצב סטטי
> (סעיף 4) אין מי שיקבל את ה-webhook — אבל אפשר לראות את כל ההזמנות
> בדאשבורד של iCount עצמו.

---

## 7. אבטחה וגיבויים

### סיסמת אדמין
- שנו מ-`alakir2026` למשהו חזק בהגדרות → אבטחה
- הסיסמה שמורה כ-SHA-256 ב-localStorage של הדפדפן

### `ADMIN_API_TOKEN`
לחיזוק אבטחה בשרת:
```bash
nano /var/www/alakir/server/.env
# הוסף שורה:
# ADMIN_API_TOKEN=$(openssl rand -hex 24)
pm2 restart alakir
```
זה דורש כותרת `x-admin-token` בכל בקשת כתיבה ל-API.

### גיבויים
- **באדמין:** הגדרות → ⬇ הורד JSON — שומרים מקומית
- **בשרת:** crontab יומי לגיבוי `data/gallery-data.json` ו-`assets/gallery-images/`:
  ```bash
  0 3 * * * cp /var/www/alakir/data/gallery-data.json /var/backups/alakir-$(date +\%Y\%m\%d).json
  0 3 * * * tar czf /var/backups/images-$(date +\%Y\%m\%d).tar.gz /var/www/alakir/assets/gallery-images/
  ```
- **iCount:** כל ההזמנות וחשבוניות שמורות ב-iCount עצמם — גיבוי כפול

---

## 8. שאלות נפוצות

### איך הקונה מקבל חשבונית?
iCount שולח אוטומטית חשבונית מס/קבלה למייל מיד אחרי שהתשלום מאושר.
זה כולל את כל הפרטים שדרושים לרשויות המס בישראל.

### איפה יושב הכסף עד שמגיע לבנק?
בחשבון iCount שלך. תוכל לראות את היתרה בדאשבורד של iCount.
ההעברה לבנק אוטומטית — בדרך כלל יום-יומיים אחרי כל עסקה (תלוי בהסכם).

### מה קורה אם לקוח רוצה החזר?
ב-iCount: **תנועות → לוח התנועות → בחר את התנועה → ביטול / החזר**.
החזר מבוצע ל-iCount, ומשם לכרטיס הלקוח, תוך 5-7 ימי עסקים.

### עליות?
- **iCount עצמו:** ניסיון 45 ימים חינם, אז ₪50-150/חודש (תלוי בחבילה)
- **מסוף סליקה:** ₪30/חודש דמי הקמה ₪199 (אם משתמשים במסוף של iCount)
- **עמלת סליקה:** 2.5%-3% פר עסקה (תלוי בהסכם הספציפי)
- **דומיין:** $10/שנה
- **אחסון אתר:** Cloudflare Pages = חינם, VPS = $0-6/חודש

### האם הסליקה תומכת בישראכרט?
כן. iCount + רוב המסופים תומכים בישראכרט, ויזה, מאסטרקרד, אמריקן אקספרס,
וגם Apple Pay ו-Google Pay (תלוי בהגדרת המסוף).

### האם אפשר תשלומים (חלוקה ל-X תשלומים)?
כן. ב-iCount בעמוד הסליקה: "אפשר תשלומים" → סמן וי + הגדר מקסימום.
האתר שלנו מעביר את הסכום הכולל; ה-iCount מציע ללקוח לפצל לתשלומים.

### האם זה PCI Compliant?
כן. פרטי כרטיסי האשראי לא נכנסים בכלל לאתר שלנו — הם מוקלדים ישירות
ב-iCount, שמאושר PCI DSS Level 1. אנחנו רק מעבירים סכום + פרטי לקוח.

### שכחתי את סיסמת האדמין!
F12 → Console → הקלידו:
```javascript
localStorage.removeItem('alakir.adminPwHash');
location.reload();
```
הסיסמה תחזור ל-`alakir2026`.
