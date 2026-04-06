import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getStudents, addStudent, importStudents } from '../utils/api';
import './Students.css';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    grade: '',
    class_section: '',
    guardian_name: '',
    guardian_phone: '',
    notes: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await getStudents();
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await addStudent(formData);
      if (response.success) {
        alert(`تم إضافة الطالب بنجاح!\nرمز الطالب: ${response.student_id}`);
        setShowAddModal(false);
        setFormData({
          full_name: '',
          grade: '',
          class_section: '',
          guardian_name: '',
          guardian_phone: '',
          notes: ''
        });
        loadStudents();
      }
    } catch (error) {
      alert('حدث خطأ في إضافة الطالب');
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to our format
        const studentsData = jsonData.map(row => ({
          full_name: row['الاسم'] || row['full_name'] || '',
          grade: row['الصف'] || row['grade'] || '',
          class_section: row['القسم'] || row['class_section'] || '',
          guardian_name: row['ولي الأمر'] || row['guardian_name'] || '',
          guardian_phone: row['رقم الهاتف'] || row['guardian_phone'] || '',
          notes: row['ملاحظات'] || row['notes'] || ''
        }));

        const response = await importStudents(studentsData);
        if (response.success) {
          alert(`تم استيراد ${response.count} طالب بنجاح!`);
          loadStudents();
        }
      } catch (error) {
        alert('حدث خطأ في استيراد الملف');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
      'الكود': s.student_id,
      'رمز QR': s.qr_code,
      'الاسم': s.full_name,
      'الصف': s.grade,
      'القسم': s.class_section,
      'ولي الأمر': s.guardian_name,
      'رقم الهاتف': s.guardian_phone,
      'تاريخ التسجيل': s.enrollment_date,
      'ملاحظات': s.notes
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الطلاب');
    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generateQRCodes = () => {
    // Generate a simple HTML page with QR codes
    const html = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>رموز QR للطلاب</title>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <style>
    body { font-family: Arial; padding: 20px; }
    .student-card { 
      border: 2px solid #1877F2; 
      padding: 20px; 
      margin: 20px; 
      page-break-after: always;
      text-align: center;
    }
    h2 { color: #1877F2; }
    canvas { margin: 20px auto; }
  </style>
</head>
<body>
  <h1>رموز QR للطلاب</h1>
  ${students.map(student => `
    <div class="student-card">
      <h2>${student.full_name}</h2>
      <p>الصف: ${student.grade} - ${student.class_section}</p>
      <canvas id="qr-${student.student_id}"></canvas>
      <p><strong>الكود:</strong> ${student.student_id}</p>
      <script>
        QRCode.toCanvas(
          document.getElementById('qr-${student.student_id}'),
          '${student.qr_code}',
          { width: 200, margin: 2 }
        );
      </script>
    </div>
  `).join('')}
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-codes.html';
    a.click();
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل الطلاب...</p>
      </div>
    );
  }

  return (
    <div className="students-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 إدارة الطلاب</h1>
          <p className="page-subtitle">إجمالي: {students.length} طالب</p>
        </div>
        <div className="actions-group">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ إضافة طالب
          </button>
          <label className="btn btn-secondary">
            📥 استيراد Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-secondary" onClick={exportToExcel}>
            📤 تصدير Excel
          </button>
          <button className="btn btn-outline" onClick={generateQRCodes}>
            📱 إنشاء رموز QR
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="form-input"
          placeholder="🔍 بحث بالاسم، الكود، أو الصف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>الاسم</th>
                <th>الصف</th>
                <th>القسم</th>
                <th>ولي الأمر</th>
                <th>رقم الهاتف</th>
                <th>تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.student_id}>
                  <td><code>{student.student_id}</code></td>
                  <td><strong>{student.full_name}</strong></td>
                  <td>{student.grade}</td>
                  <td>{student.class_section}</td>
                  <td>{student.guardian_name}</td>
                  <td>{student.guardian_phone}</td>
                  <td>{student.enrollment_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ إضافة طالب جديد</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label className="form-label">الاسم الكامل *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">الصف *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">القسم</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.class_section}
                    onChange={(e) => setFormData({...formData, class_section: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ولي الأمر</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">رقم الهاتف</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">ملاحظات</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">حفظ</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
