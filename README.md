# AllamTechno Delivery — Firebase Ready (FULL)
## ماذا بداخل الحزمة؟
- index.html — الواجهة كاملة بنفس التصميم (Splash + Login + أقسام).
- config.example.js — انسخه إلى config.js وضع مفاتيح Firebase.
- app-auth.js — تسجيل الدخول باسم مستخدم (يحوّله لبريد من مجموعة usernames).
- app-data.js — قراءة الطلبات وملء KPIs والقوائم والخريطة.
- seed.html — زرع بيانات تجريبية.
- firestore.rules.txt — قواعد Firestore.

## الإعداد السريع
1) Firebase Console → Authentication → فعّل Email/Password ثم Add user (email+password).
2) انسخ config.example.js إلى config.js وضع مفاتيح مشروعك.
3) Firestore → Rules → الصق محتوى firestore.rules.txt → Publish.
4) افتح seed.html واملأ username/email/password/role ثم زرع.
5) افتح index.html وسجّل دخول باسم المستخدم وكلمته (الموافقة مع Authentication).

> لإظهار أدوات المطوّر تلقائيًا اجعل role = developer.
