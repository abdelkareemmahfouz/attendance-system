# 📱 نظام الحضور الذكي | Smart Attendance System

نظام حضور وغياب ذكي للمدارس الصغيرة باستخدام تقنية QR Code

## 🎯 المميزات الرئيسية

- ✅ مسح رموز QR للتسجيل السريع
- 📊 لوحة تحكم تفاعلية مع إحصائيات مباشرة
- 📄 تقارير قابلة للتصدير (Excel + PDF)
- ⚠️ نظام تحذيرات متقدم بالألوان
- 📱 واجهة متجاوبة (Mobile First)
- 🌓 وضع فاتح وغامق
- 🔄 تكامل مع Google Sheets

## 🛠️ التقنيات المستخدمة

### Frontend
- React 18
- React Router Dom
- html5-qrcode (مسح QR)
- Recharts (الرسوم البيانية)
- xlsx (استيراد/تصدير Excel)
- jsPDF (تصدير PDF)

### Backend
- Google Apps Script
- Google Sheets (قاعدة البيانات)

### Hosting
- Vercel (Frontend)
- Google Apps Script (Backend API)

---

## 📋 خطوات التثبيت والنشر

### المرحلة 1️⃣: إعداد قاعدة البيانات (Google Sheets)

#### 1. إنشاء Google Sheet جديد

1. افتح [Google Sheets](https://sheets.google.com)
2. أنشئ مصنف جديد واسمه "School_Attendance_DB"
3. انسخ رابط المصنف (Spreadsheet ID من الرابط)

#### 2. إضافة Apps Script

1. من القائمة: Extensions → Apps Script
2. امسح الكود الافتراضي
3. انسخ محتوى ملف `apps-script-backend.gs` بالكامل والصقه
4. احفظ المشروع (Ctrl+S) واسمه "Attendance System API"

#### 3. إعداد Properties

في Apps Script Editor:

```javascript
// اضغط على Project Settings (⚙️) من القائمة الجانبية
// ثم Script Properties → Add script property

// أضف:
Key: SPREADSHEET_ID
Value: [ضع هنا الـ Spreadsheet ID من رابط Google Sheet]
```

#### 4. تشغيل Setup

1. في Editor، اختر Function: `setupSpreadsheet`
2. اضغط Run (▶️)
3. سيطلب منك الموافقة على الأذونات - وافق على كل الأذونات
4. افتح Google Sheet وتأكد من إنشاء الجداول

#### 5. نشر Web App

1. اضغط على Deploy → New deployment
2. اختر:
   - Type: Web app
   - Description: "Attendance API v1"
   - Execute as: **Me**
   - Who has access: **Anyone**
3. اضغط Deploy
4. **انسخ Web app URL** (سنحتاجه في الخطوة التالية)

---

### المرحلة 2️⃣: نشر Frontend على Vercel

#### 1. تجهيز المشروع

```bash
# تأكد من وجودك في مجلد المشروع
cd attendance-system

# تحديث ملف .env بـ API URL
echo "REACT_APP_API_URL=YOUR_APPS_SCRIPT_URL_HERE" > .env

# استبدل YOUR_APPS_SCRIPT_URL_HERE بالرابط الذي نسخته من Apps Script
```

#### 2. رفع المشروع على GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit - Smart Attendance System"

# إنشاء repository على GitHub
# ثم:
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

#### 3. النشر على Vercel

**الطريقة الأولى: من Vercel Dashboard**

1. افتح [vercel.com](https://vercel.com)
2. سجل دخول بـ GitHub
3. اضغط "New Project"
4. اختر repository المشروع
5. في Build Settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
6. في Environment Variables أضف:
   ```
   REACT_APP_API_URL = [Web App URL من Apps Script]
   ```
7. اضغط Deploy

**الطريقة الثانية: من Terminal**

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod

# اتبع التعليمات وأدخل:
# - Environment Variable: REACT_APP_API_URL
# - Value: [Web App URL]
```
## 📁 هيكل المشروع

```
attendance-system/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Scanner.js
│   │   ├── Dashboard.js
│   │   ├── Students.js
│   │   ├── Reports.js
│   │   └── Settings.js
│   ├── utils/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── apps-script-backend.gs
├── database-structure.json
├── package.json
└── .env
```

---

## 🎨 Theme System

النظام يدعم وضعين:

### Light Theme (Facebook Blue)
- Primary: #1877F2
- Backgrounds: White & Light Gray
- Clean & Professional

### Dark Theme (Gold Accents)
- Primary: #FFD700 (Gold)
- Backgrounds: Dark Gray & Black
- Modern & Elegant

---

## 🔧 الإعدادات

يمكن تعديل الإعدادات من Google Sheet → Settings:

| الإعداد | الوصف | القيمة الافتراضية |
|--------|-------|-------------------|
| school_start_time | موعد بداية اليوم | 08:00 |
| late_threshold_minutes | دقائق التأخير المسموح | 15 |
| absence_warning_days | أيام الغياب للتحذير الأصفر | 3 |
| absence_critical_days | أيام الغياب للتحذير الأحمر | 5 |

---

## 📊 نظام التحذيرات

| المستوى | اللون | الشرط |
|--------|------|------|
| آمن | 🟢 أخضر | أقل من 3 أيام غياب |
| تحذير | 🟡 أصفر | 3-4 أيام غياب |
| خطر | 🔴 أحمر | 5 أيام غياب فأكثر |

---

## 🔄 التكامل المستقبلي

هذا النظام جاهز للتكامل مع:

- ✅ نظام إدارة الرسوم
- ✅ نظام الامتحانات
- ✅ نظام التواصل مع أولياء الأمور
- ✅ نظام تتبع الأداء الأكاديمي

---

## 📱 معلومات الاتصال

**Developer:** Abdelkareem  
**mobile:** 01090075321
**Company:** X Digital Transformation  
**Location:** Cairo, Egypt  
**Tech Stack:** Full-Stack JavaScript (React, Node.js, Google Apps Script)

---

## 📝 License

هذا المشروع مفتوح المصدر للاستخدام التعليمي والتجاري للمدارس الصغيرة.

---

## 🎉 ملاحظات مهمة

1. **الأمان:** لا تشارك Spreadsheet ID أو API URL علناً
2. **النسخ الاحتياطي:** قم بعمل نسخة احتياطية من Google Sheet بانتظام
3. **التحديثات:** احتفظ بإصدار من الكود على GitHub
4. **الأداء:** النظام يدعم حتى 1000 طالب بأداء ممتاز
5. **المتصفحات:** يعمل على Chrome, Firefox, Safari, Edge

---

## 🚀 الخطوات التالية

بعد النشر الناجح:

1. ✅ أضف جميع الطلاب (يدوياً أو عبر Excel)
2. ✅ اطبع رموز QR ووزعها
3. ✅ درب المدرسين على استخدام النظام
4. ✅ راقب التقارير يومياً
5. ✅ اضبط الإعدادات حسب احتياجات مدرستك

