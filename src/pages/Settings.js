import React, { useState, useEffect } from 'react';
import { getSettings } from '../utils/api';
import './Settings.css';

function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ الإعدادات</h1>
          <p className="page-subtitle">إعدادات النظام العامة</p>
        </div>
      </div>

      {/* School Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon">🏫</div>
            معلومات المدرسة
          </h3>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">اسم المدرسة</div>
            <div className="setting-value">{settings.school_name || 'غير محدد'}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">العام الدراسي</div>
            <div className="setting-value">{settings.current_academic_year || 'غير محدد'}</div>
          </div>
        </div>
      </div>

      {/* Attendance Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon">⏰</div>
            إعدادات الحضور
          </h3>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">موعد بداية اليوم الدراسي</div>
            <div className="setting-value highlighted">{settings.school_start_time || '08:00'}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">عدد دقائق التأخير المسموح</div>
            <div className="setting-value highlighted">{settings.late_threshold_minutes || '15'} دقيقة</div>
          </div>
        </div>
      </div>

      {/* Warning Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon warning">⚠️</div>
            إعدادات التحذيرات
          </h3>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">
                <span className="warning-indicator yellow"></span>
                عدد أيام الغياب للتحذير الأصفر
              </div>
              <div className="setting-description">
                يتم تحذير الطالب عند الوصول لهذا العدد من أيام الغياب
              </div>
            </div>
            <div className="setting-value warning-value">{settings.absence_warning_days || '3'} أيام</div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">
                <span className="warning-indicator red"></span>
                عدد أيام الغياب للتحذير الأحمر
              </div>
              <div className="setting-description">
                يتم تحذير الطالب بشكل حرج عند الوصول لهذا العدد
              </div>
            </div>
            <div className="setting-value critical-value">{settings.absence_critical_days || '5'} أيام</div>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon">🔗</div>
            إعدادات الاتصال
          </h3>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">Google Apps Script URL</div>
            <div className="setting-value code">
              {process.env.REACT_APP_API_URL || 'لم يتم التكوين'}
            </div>
          </div>
          <div className="alert alert-info">
            <span>ℹ️</span>
            <div>
              <strong>ملحوظة:</strong> لتغيير رابط API، قم بتحديث ملف <code>.env</code> في مجلد المشروع
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon">ℹ️</div>
            معلومات النظام
          </h3>
        </div>
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-label">اسم النظام</div>
            <div className="setting-value">نظام الحضور الذكي</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">الإصدار</div>
            <div className="setting-value">1.0.0</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">تاريخ البناء</div>
            <div className="setting-value">{new Date().toLocaleDateString('ar-EG')}</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon">📖</div>
            إرشادات الاستخدام
          </h3>
        </div>
        <div className="instructions">
          <div className="instruction-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>إضافة الطلاب</h4>
              <p>انتقل إلى قسم "الطلاب" لإضافة الطلاب يدوياً أو استيراد ملف Excel</p>
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>طباعة رموز QR</h4>
              <p>من قسم "الطلاب"، اضغط على "إنشاء رموز QR" ثم اطبع الملف الناتج</p>
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>بدء المسح</h4>
              <p>استخدم صفحة "المسح" لتسجيل حضور الطلاب يومياً باستخدام الكاميرا</p>
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>متابعة التقارير</h4>
              <p>راجع لوحة التحكم والتقارير لمتابعة الحضور والغياب</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
