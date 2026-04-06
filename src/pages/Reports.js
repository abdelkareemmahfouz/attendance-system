import React, { useState } from 'react';
import { getAttendanceReport } from '../utils/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Reports.css';

function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    studentId: ''
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await getAttendanceReport(
        filters.startDate,
        filters.endDate,
        filters.studentId || null
      );

      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('حدث خطأ في إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData || !reportData.records.length) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(reportData.records.map(r => ({
      'التاريخ': r.date,
      'اسم الطالب': r.student_name,
      'الصف': r.grade,
      'القسم': r.class_section,
      'وقت الوصول': new Date(r.check_in_time).toLocaleTimeString('ar-EG'),
      'الحالة': r.status === 'present' ? 'حاضر' : r.status === 'late' ? 'متأخر' : 'غائب',
      'المسجل بواسطة': r.marked_by
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقرير الحضور');
    
    const fileName = `attendance_report_${filters.startDate}_to_${filters.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    if (!reportData || !reportData.records.length) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const doc = new jsPDF();

    // Add Arabic font support (using default for now)
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(18);
    doc.text('Attendance Report', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`From: ${filters.startDate} To: ${filters.endDate}`, 105, 25, { align: 'center' });
    doc.text(`Total Records: ${reportData.total_records}`, 105, 32, { align: 'center' });

    // Table
    const tableData = reportData.records.map(r => [
      r.date,
      r.student_name,
      r.grade,
      r.class_section,
      new Date(r.check_in_time).toLocaleTimeString('ar-EG'),
      r.status === 'present' ? 'Present' : r.status === 'late' ? 'Late' : 'Absent',
      r.marked_by
    ]);

    doc.autoTable({
      head: [['Date', 'Student', 'Grade', 'Section', 'Time', 'Status', 'Marked By']],
      body: tableData,
      startY: 40,
      styles: { font: 'helvetica', fontSize: 9 },
      headStyles: { fillColor: [24, 119, 242], textColor: 255 }
    });

    const fileName = `attendance_report_${filters.startDate}_to_${filters.endDate}.pdf`;
    doc.save(fileName);
  };

  const getStatusSummary = () => {
    if (!reportData || !reportData.records.length) return null;

    const summary = {
      present: reportData.records.filter(r => r.status === 'present').length,
      late: reportData.records.filter(r => r.status === 'late').length,
      absent: reportData.records.filter(r => r.status === 'absent').length
    };

    return summary;
  };

  const summary = getStatusSummary();

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📄 التقارير والإحصائيات</h1>
          <p className="page-subtitle">إنشاء وتصدير تقارير الحضور</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <div className="card-icon">🔍</div>
            فلاتر التقرير
          </h3>
        </div>

        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">من تاريخ</label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              max={filters.endDate}
            />
          </div>

          <div className="form-group">
            <label className="form-label">إلى تاريخ</label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              min={filters.startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">كود الطالب (اختياري)</label>
            <input
              type="text"
              className="form-input"
              placeholder="STD-2026-..."
              value={filters.studentId}
              onChange={(e) => setFilters({...filters, studentId: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button 
              className="btn btn-primary w-100"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? '⏳ جاري الإنشاء...' : '📊 إنشاء التقرير'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {reportData && (
        <>
          {/* Summary Stats */}
          {summary && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">إجمالي السجلات</span>
                  <div className="stat-icon primary">📋</div>
                </div>
                <div className="stat-value">{reportData.total_records}</div>
              </div>

              <div className="stat-card success">
                <div className="stat-header">
                  <span className="stat-label">حاضر</span>
                  <div className="stat-icon success">✓</div>
                </div>
                <div className="stat-value">{summary.present}</div>
                <div className="stat-subtitle">
                  {((summary.present / reportData.total_records) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-header">
                  <span className="stat-label">متأخر</span>
                  <div className="stat-icon warning">⏰</div>
                </div>
                <div className="stat-value">{summary.late}</div>
                <div className="stat-subtitle">
                  {((summary.late / reportData.total_records) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="stat-card danger">
                <div className="stat-header">
                  <span className="stat-label">غائب</span>
                  <div className="stat-icon danger">✗</div>
                </div>
                <div className="stat-value">{summary.absent}</div>
                <div className="stat-subtitle">
                  {((summary.absent / reportData.total_records) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <div className="card-icon">💾</div>
                تصدير التقرير
              </h3>
              <div className="export-actions">
                <button className="btn btn-success" onClick={exportToExcel}>
                  📊 Excel
                </button>
                <button className="btn btn-danger" onClick={exportToPDF}>
                  📄 PDF
                </button>
              </div>
            </div>

            {/* Report Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>اسم الطالب</th>
                    <th>الصف</th>
                    <th>القسم</th>
                    <th>وقت الوصول</th>
                    <th>الحالة</th>
                    <th>المسجل بواسطة</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.records.map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td><strong>{record.student_name}</strong></td>
                      <td>{record.grade}</td>
                      <td>{record.class_section}</td>
                      <td>
                        {new Date(record.check_in_time).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <span className={`badge badge-${
                          record.status === 'present' ? 'success' : 
                          record.status === 'late' ? 'warning' : 'danger'
                        }`}>
                          {record.status === 'present' ? 'حاضر' : 
                           record.status === 'late' ? 'متأخر' : 'غائب'}
                        </span>
                      </td>
                      <td>{record.marked_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!reportData && !loading && (
        <div className="card">
          <div className="no-data-state">
            <div className="no-data-icon">📊</div>
            <h3>لا توجد بيانات</h3>
            <p>اختر الفترة الزمنية واضغط على "إنشاء التقرير"</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
