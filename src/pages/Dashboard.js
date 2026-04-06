import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTodayAttendance, getDashboardStats } from '../utils/api';
import './Dashboard.css';

function Dashboard() {
  const [todayStats, setTodayStats] = useState(null);
  const [warningStats, setWarningStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [todayData, statsData] = await Promise.all([
        getTodayAttendance(selectedDate),
        getDashboardStats()
      ]);

      if (todayData.success) {
        setTodayStats(todayData.data);
      }

      if (statsData.success) {
        setWarningStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  const attendanceChartData = todayStats ? [
    { name: 'حاضر', value: todayStats.present, color: '#42B72A' },
    { name: 'متأخر', value: todayStats.late, color: '#FFB800' },
    { name: 'غائب', value: todayStats.absent, color: '#F02849' }
  ] : [];

  const warningChartData = warningStats ? [
    { name: 'مستوى أمان', value: warningStats.warning_green, color: '#42B72A' },
    { name: 'تحذير', value: warningStats.warning_yellow, color: '#FFB800' },
    { name: 'خطر', value: warningStats.warning_red, color: '#F02849' }
  ] : [];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 لوحة التحكم</h1>
          <p className="page-subtitle">نظرة عامة على الحضور والغياب</p>
        </div>
        <div className="date-selector">
          <label>التاريخ:</label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">إجمالي الطلاب</span>
            <div className="stat-icon primary">👥</div>
          </div>
          <div className="stat-value">{todayStats?.total_students || 0}</div>
          <div className="stat-subtitle">طالب مسجل</div>
        </div>

        <div className="stat-card success">
          <div className="stat-header">
            <span className="stat-label">حاضرين</span>
            <div className="stat-icon success">✓</div>
          </div>
          <div className="stat-value">{todayStats?.present || 0}</div>
          <div className="stat-subtitle">
            {todayStats?.total_students > 0 
              ? `${((todayStats.present / todayStats.total_students) * 100).toFixed(1)}%`
              : '0%'}
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-header">
            <span className="stat-label">متأخرين</span>
            <div className="stat-icon warning">⏰</div>
          </div>
          <div className="stat-value">{todayStats?.late || 0}</div>
          <div className="stat-subtitle">
            {todayStats?.total_students > 0 
              ? `${((todayStats.late / todayStats.total_students) * 100).toFixed(1)}%`
              : '0%'}
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-header">
            <span className="stat-label">غائبين</span>
            <div className="stat-icon danger">✗</div>
          </div>
          <div className="stat-value">{todayStats?.absent || 0}</div>
          <div className="stat-subtitle">
            {todayStats?.total_students > 0 
              ? `${((todayStats.absent / todayStats.total_students) * 100).toFixed(1)}%`
              : '0%'}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Attendance Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <div className="card-icon">📊</div>
              توزيع الحضور اليوم
            </h3>
          </div>
          <div className="chart-container">
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">لا توجد بيانات لهذا التاريخ</div>
            )}
          </div>
        </div>

        {/* Warning Levels Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <div className="card-icon warning">⚠️</div>
              مستويات التحذير
            </h3>
          </div>
          <div className="chart-container">
            {warningChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={warningChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="عدد الطلاب">
                    {warningChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">لا توجد بيانات</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Absentees */}
      {warningStats?.top_absentees && warningStats.top_absentees.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <div className="card-icon danger">📋</div>
              الطلاب الأكثر غياباً
            </h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>اسم الطالب</th>
                  <th>أيام الغياب</th>
                  <th>أيام التأخير</th>
                  <th>الحضور</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {warningStats.top_absentees.map((student, index) => (
                  <tr key={student.student_id}>
                    <td>{index + 1}</td>
                    <td>{student.student_name}</td>
                    <td>
                      <span className="badge badge-danger">
                        {student.total_absences}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        {student.total_late}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {student.total_present}
                      </span>
                    </td>
                    <td>
                      <span className={`warning-badge ${student.warning_level}`}>
                        {student.warning_level === 'green' && '✓ آمن'}
                        {student.warning_level === 'yellow' && '⚠️ تحذير'}
                        {student.warning_level === 'red' && '🔴 خطر'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Today's Records */}
      {todayStats?.records && todayStats.records.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <div className="card-icon">📝</div>
              سجل اليوم ({todayStats.records.length})
            </h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>الصف</th>
                  <th>القسم</th>
                  <th>وقت الوصول</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {todayStats.records.slice(0, 20).map((record, index) => (
                  <tr key={index}>
                    <td>{record.student_name}</td>
                    <td>{record.grade}</td>
                    <td>{record.section}</td>
                    <td>
                      {new Date(record.check_in_time).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <span className={`badge badge-${record.status === 'present' ? 'success' : 'warning'}`}>
                        {record.status === 'present' ? 'حاضر' : 'متأخر'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
