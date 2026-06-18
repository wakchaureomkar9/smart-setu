import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  PieChart as PieChartIcon, Download, Users, FileText, CheckCircle, 
  XCircle, Filter, Search, Calendar, FileBadge
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#009B8D', '#f59e0b', '#ef4444', '#3b82f6'];

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [periodicData, setPeriodicData] = useState([]);
  const [schemesData, setSchemesData] = useState([]);
  const [applications, setApplications] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSummary();
    fetchSchemes();
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchPeriodicData();
  }, [period]);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/admin/reports/summary');
      setSummary(res.data);
    } catch { toast.error('Failed to load summary'); }
  };

  const fetchPeriodicData = async () => {
    try {
      const res = await api.get(`/admin/reports/periodic?period=${period}`);
      setPeriodicData(res.data);
    } catch { toast.error('Failed to load periodic data'); }
  };

  const fetchSchemes = async () => {
    try {
      const res = await api.get('/admin/reports/schemes');
      setSchemesData(res.data);
    } catch { toast.error('Failed to load scheme reports'); }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admin/reports/applications');
      setApplications(res.data);
      setLoading(false);
    } catch { 
      toast.error('Failed to load application reports'); 
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(applications.map(a => ({
      'Application ID': a.id,
      'Citizen Name': a.citizen_name,
      'Email': a.citizen_email,
      'Scheme': a.scheme_title,
      'Status': a.status,
      'Applied Date': new Date(a.applied_at).toLocaleDateString(),
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'applications_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Smart Setu - Applications Report', 14, 15);
    
    const tableData = applications.map(a => [
      a.id, a.citizen_name, a.scheme_title, a.status, new Date(a.applied_at).toLocaleDateString()
    ]);
    
    doc.autoTable({
      head: [['ID', 'Citizen Name', 'Scheme', 'Status', 'Date']],
      body: tableData,
      startY: 20,
    });
    
    doc.save('applications_report.pdf');
  };

  const filteredApps = applications.filter(a => {
    const matchesSearch = a.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.scheme_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pieData = [
    { name: 'Approved', value: summary?.applications?.approved || 0 },
    { name: 'Pending', value: summary?.applications?.pending || 0 },
    { name: 'Rejected', value: summary?.applications?.rejected || 0 },
  ];

  return (
    <div className="space-y-7 animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <PieChartIcon className="w-7 h-7 text-primary" /> Reports & Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Analyze system usage and application trends.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-outline text-xs py-2 px-3 inline-flex items-center">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
          <button onClick={exportPDF} className="btn-primary text-xs py-2 px-3 bg-[#009B8D] border-none inline-flex items-center text-white">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#162040] rounded-2xl p-5 text-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{summary?.users?.total || 0}</div>
          <div className="text-sm text-white/70">Total Users</div>
        </div>
        <div className="bg-[#009B8D] rounded-2xl p-5 text-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{summary?.applications?.total || 0}</div>
          <div className="text-sm text-white/80">Total Applications</div>
        </div>
        <div className="bg-emerald-500 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{summary?.applications?.approved || 0}</div>
          <div className="text-sm text-white/80">Approved</div>
        </div>
        <div className="bg-red-500 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{summary?.applications?.rejected || 0}</div>
          <div className="text-sm text-white/80">Rejected</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Application Status</h3>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Periodic Trend</h3>
            <select 
              value={period} 
              onChange={e => setPeriod(e.target.value)}
              className="input-field py-1.5 px-3 w-auto text-sm bg-gray-50 rounded-lg border-gray-200"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="h-64 flex-1">
            {periodicData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No analytics data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodicData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[4,4,0,0]} />
                  <Bar dataKey="approved" fill="#009B8D" name="Approved" radius={[4,4,0,0]} />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4,4,0,0]} />
                  <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Scheme Wise Report */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Scheme-wise Analytics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheme Name</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rejected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {schemesData.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-5 font-semibold text-gray-900">{s.scheme_name}</td>
                  <td className="py-3 px-5 text-gray-600">{s.total}</td>
                  <td className="py-3 px-5 text-emerald-600 font-medium">{s.approved}</td>
                  <td className="py-3 px-5 text-amber-600 font-medium">{s.pending}</td>
                  <td className="py-3 px-5 text-red-600 font-medium">{s.rejected}</td>
                </tr>
              ))}
              {schemesData.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-gray-900 shrink-0">Recent Applications</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                className="input-field pl-9 py-2 text-sm w-full bg-gray-50" 
                placeholder="Search citizen or scheme..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="input-field py-2 px-3 text-sm w-auto bg-gray-50"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Citizen</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheme</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr>
                   <td colSpan="5" className="py-8 text-center text-gray-500">Loading data...</td>
                 </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No applications found</td>
                </tr>
              ) : (
                filteredApps.slice(0, 50).map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="py-3 px-5 text-gray-500 font-mono text-xs">#{String(app.id).padStart(5,'0')}</td>
                    <td className="py-3 px-5">
                      <div className="font-semibold text-gray-900">{app.citizen_name}</div>
                      <div className="text-xs text-gray-400">{app.citizen_email}</div>
                    </td>
                    <td className="py-3 px-5 text-gray-700 max-w-xs truncate">{app.scheme_title}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold
                        ${app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          app.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                          'bg-amber-100 text-amber-700'}`}
                      >
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-gray-500 text-xs">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {filteredApps.length > 50 && (
             <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
               Showing 50 of {filteredApps.length} entries. Use export for full data.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
