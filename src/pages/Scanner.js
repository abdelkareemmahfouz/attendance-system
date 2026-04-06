import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { markAttendance } from '../utils/api';
import './Scanner.css';

function Scanner({ currentTeacher, onTeacherLogin }) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [scannedToday, setScannedToday] = useState([]);
  const [showTeacherInput, setShowTeacherInput] = useState(false);

  useEffect(() => {
    // Load scanned today from localStorage
    const today = new Date().toISOString().split('T')[0];
    const savedScans = localStorage.getItem(`scans_${today}`);
    if (savedScans) {
      setScannedToday(JSON.parse(savedScans));
    }

    // Auto-show teacher input if no teacher logged in
    if (!currentTeacher) {
      setShowTeacherInput(true);
    }

    return () => {
      if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.clear();
      }
    };
  }, [currentTeacher]);

  const handleTeacherLogin = () => {
    if (teacherName.trim()) {
      const teacher = {
        name: teacherName.trim(),
        login_time: new Date().toISOString()
      };
      onTeacherLogin(teacher);
      setShowTeacherInput(false);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      rememberLastUsedCamera: true
    };

    const scanner = new Html5QrcodeScanner('qr-reader', config, false);
    window.html5QrcodeScanner = scanner;

    scanner.render(onScanSuccess, onScanError);
  };

  const onScanSuccess = async (decodedText, decodedResult) => {
    console.log('QR Code scanned:', decodedText);
    
    // Stop scanning temporarily
    if (window.html5QrcodeScanner) {
      window.html5QrcodeScanner.clear();
    }
    setIsScanning(false);

    // Mark attendance
    try {
      const response = await markAttendance(
        decodedText,
        currentTeacher?.name || 'معلم غير معروف'
      );

      if (response.success) {
        setLastScan({
          type: 'success',
          message: response.message,
          student: response.student,
          status: response.status,
          time: response.time
        });

        // Add to scanned today
        const newScan = {
          student_name: response.student.name,
          status: response.status,
          time: new Date().toLocaleTimeString('ar-EG'),
          grade: response.student.grade
        };

        const updated = [...scannedToday, newScan];
        setScannedToday(updated);

        // Save to localStorage
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`scans_${today}`, JSON.stringify(updated));

        // Play success sound
        playSound('success');
      } else {
        setLastScan({
          type: 'error',
          message: response.message || response.error,
          student: response.student
        });
        playSound('error');
      }
    } catch (error) {
      setLastScan({
        type: 'error',
        message: 'حدث خطأ في الاتصال بالنظام',
        error: error.message
      });
      playSound('error');
    }

    // Auto-restart scanning after 3 seconds
    setTimeout(() => {
      setLastScan(null);
      startScanning();
    }, 3000);
  };

  const onScanError = (errorMessage) => {
    // Silent error handling - QR scanner throws many false errors
  };

  const playSound = (type) => {
    const audio = new Audio();
    if (type === 'success') {
      // Success beep
      audio.src = 'data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU4AAAC';
    } else {
      // Error beep
      audio.src = 'data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU4AAAC';
    }
    audio.play().catch(() => {});
  };

  const clearTodayScans = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.removeItem(`scans_${today}`);
    setScannedToday([]);
  };

  return (
    <div className="scanner-page">
      <div className="scanner-container">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <div className="card-icon">📷</div>
              مسح رموز QR للحضور
            </h2>
            {currentTeacher && (
              <div className="teacher-badge">
                <span>المدرس: {currentTeacher.name}</span>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowTeacherInput(true)}
                >
                  تغيير
                </button>
              </div>
            )}
          </div>

          {showTeacherInput && (
            <div className="teacher-input-section">
              <div className="alert alert-info">
                <span>📋</span>
                <span>الرجاء إدخال اسمك قبل بدء المسح</span>
              </div>
              <div className="form-group">
                <label className="form-label">اسم المدرس</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="أدخل اسمك"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTeacherLogin()}
                />
              </div>
              <button 
                className="btn btn-primary w-100"
                onClick={handleTeacherLogin}
                disabled={!teacherName.trim()}
              >
                تسجيل الدخول
              </button>
            </div>
          )}

          {!showTeacherInput && (
            <>
              {!isScanning && !lastScan && (
                <div className="scan-start">
                  <div className="scan-icon">📱</div>
                  <h3>ابدأ مسح رموز الطلاب</h3>
                  <p>اضغط على الزر أدناه لبدء المسح الضوئي</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={startScanning}
                  >
                    🎯 بدء المسح
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="scanning-section">
                  <div id="qr-reader" className="qr-reader"></div>
                  <div className="scanning-instructions">
                    <p>📸 وجه الكاميرا نحو رمز QR الخاص بالطالب</p>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        if (window.html5QrcodeScanner) {
                          window.html5QrcodeScanner.clear();
                        }
                        setIsScanning(false);
                      }}
                    >
                      إيقاف المسح
                    </button>
                  </div>
                </div>
              )}

              {lastScan && (
                <div className={`scan-result ${lastScan.type}`}>
                  <div className="result-icon">
                    {lastScan.type === 'success' ? '✅' : '❌'}
                  </div>
                  <div className="result-content">
                    <h3>{lastScan.message}</h3>
                    {lastScan.student && (
                      <div className="student-info">
                        <p><strong>الطالب:</strong> {lastScan.student.name}</p>
                        {lastScan.student.grade && (
                          <p><strong>الصف:</strong> {lastScan.student.grade}</p>
                        )}
                        {lastScan.status && (
                          <span className={`badge badge-${lastScan.status === 'present' ? 'success' : 'warning'}`}>
                            {lastScan.status === 'present' ? 'حاضر' : 'متأخر'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Today's Scanned Students */}
        {scannedToday.length > 0 && (
          <div className="card mt-3">
            <div className="card-header">
              <h3 className="card-title">
                <div className="card-icon success">✓</div>
                تم تسجيلهم اليوم ({scannedToday.length})
              </h3>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={clearTodayScans}
              >
                مسح القائمة
              </button>
            </div>
            <div className="scanned-list">
              {scannedToday.slice().reverse().map((scan, index) => (
                <div key={index} className="scanned-item">
                  <div className="scanned-info">
                    <span className="student-name">{scan.student_name}</span>
                    <span className="student-grade">{scan.grade}</span>
                  </div>
                  <div className="scanned-meta">
                    <span className={`badge badge-${scan.status === 'present' ? 'success' : 'warning'}`}>
                      {scan.status === 'present' ? 'حاضر' : 'متأخر'}
                    </span>
                    <span className="scan-time">{scan.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="stats-grid mt-3">
          <div className="stat-card success">
            <div className="stat-header">
              <span className="stat-label">تم تسجيلهم اليوم</span>
              <div className="stat-icon success">✓</div>
            </div>
            <div className="stat-value">{scannedToday.length}</div>
            <div className="stat-subtitle">طالب</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">حاضرين</span>
              <div className="stat-icon primary">📊</div>
            </div>
            <div className="stat-value">
              {scannedToday.filter(s => s.status === 'present').length}
            </div>
            <div className="stat-subtitle">طالب</div>
          </div>

          <div className="stat-card warning">
            <div className="stat-header">
              <span className="stat-label">متأخرين</span>
              <div className="stat-icon warning">⏰</div>
            </div>
            <div className="stat-value">
              {scannedToday.filter(s => s.status === 'late').length}
            </div>
            <div className="stat-subtitle">طالب</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scanner;
