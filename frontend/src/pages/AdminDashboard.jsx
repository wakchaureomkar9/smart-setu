import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Users, FileText, CheckCircle, Clock, XCircle, Upload,
  Edit, Search, Filter, X, ChevronDown, LayoutDashboard,
  TrendingUp, Activity, RefreshCw
} from 'lucide-react';

const statusConfig = {
  pending:     { label: 'Pending',     cls: 'badge-pending',     icon: Clock },
  in_progress: { label: 'In Progress', cls: 'badge-in-progress', icon: Clock },
  approved:    { label: 'Approved',    cls: 'badge-approved',    icon: CheckCircle },
  rejected:    { label: 'Rejected',    cls: 'badge-rejected',    icon: XCircle },
};

const StatCard = ({ label, value, icon: Icon, colorClass, bgClass }) => (
  <div className={`${bgClass} rounded-2xl p-5 border border-transparent`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="text-3xl font-extrabold text-white mb-1">{value ?? '--'}</div>
    <div className="text-sm text-white/80 font-medium">{label}</div>
  </div>
);

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', admin_note: '' });
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Try new stats endpoint first
      try {
        const statsRes = await api.get('/auth/admin/stats');
        setStats(statsRes.data.stats);
      } catch {}
      
      const res = await api.get('/applications/admin/all');
      const apps = res.data;
      setApplications(apps);
      if (!stats) {
        setStats({
          totalApplications: apps.length,
          pending: apps.filter(a => a.status === 'pending').length,
          in_progress: apps.filter(a => a.status === 'in_progress').length,
          approved: apps.filter(a => a.status === 'approved').length,
          rejected: apps.filter(a => a.status === 'rejected').length,
          totalCitizens: null,
          activeSchemes: null,
        });
      }
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleUpdateStatus = async () => {
    if (!statusUpdate.status) return toast.error('Please select a status');
    setUpdating(true);
    try {
      await api.patch(`/applications/${selectedApp.id}/status`, statusUpdate);
      toast.success('Status updated successfully');
      setSelectedApp(null);
      fetchData();
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  const handleUploadResult = async (file) => {
    if (!file || !selectedApp) return;
    const formData = new FormData();
    formData.append('file', file);
    setUpdating(true);
    setUploadProgress(10);
    try {
      await api.patch(`/applications/${selectedApp.id}/result`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
      });
      toast.success('Certificate uploaded & application approved! ✅');
      setSelectedApp(null);
      fetchData();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch { toast.error('Failed to upload result'); }
    finally { setUpdating(false); setUploadProgress(0); }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleUploadResult(e.dataTransfer.files[0]);
  };

  const openModal = (app) => {
    setSelectedApp(app);
    setStatusUpdate({ status: app.status, admin_note: app.admin_note || '' });
    setUploadProgress(0);
  };

  const filtered = applications
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .filter(a =>
      a.citizen_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.citizen_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.scheme_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a.id).includes(searchTerm)
    );

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-primary" /> Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage citizen applications and portal statistics.</p>
        </div>
        <button onClick={handleRefresh} className="btn-outline inline-flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={stats?.totalApplications} icon={FileText} bgClass="bg-primary" />
        <StatCard label="Pending" value={stats?.pending} icon={Clock} bgClass="bg-amber-500" />
        <StatCard label="Approved" value={stats?.approved} icon={CheckCircle} bgClass="bg-emerald-500" />
        <StatCard label="Rejected" value={stats?.rejected} icon={XCircle} bgClass="bg-red-500" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-gray-900">{stats?.in_progress ?? '--'}</div>
            <div className="text-xs text-gray-500 font-medium">In Progress</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 text-primary rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-gray-900">{stats?.totalCitizens ?? '--'}</div>
            <div className="text-xs text-gray-500 font-medium">Citizens</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-gray-900">{stats?.activeSchemes ?? '--'}</div>
            <div className="text-xs text-gray-500 font-medium">Active Schemes</div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" className="input-field pl-10 py-2" placeholder="Search by citizen, scheme, or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field py-2 w-auto">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID / Date</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Citizen</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheme</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(app => {
                  const cfg = statusConfig[app.status] || statusConfig.pending;
                  const Icon = cfg.icon;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5 text-gray-500">
                        <div className="font-mono text-xs font-semibold text-gray-700">#{String(app.id).padStart(5,'0')}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(app.applied_at).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-gray-900 text-sm">{app.citizen_name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{app.citizen_email}</div>
                      </td>
                      <td className="py-4 px-5 text-gray-700 font-medium text-sm max-w-xs">
                        <span className="line-clamp-2">{app.scheme_title}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={cfg.cls}><Icon className="w-3 h-3" />{cfg.label}</span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button onClick={() => openModal(app)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition-colors">
                          <Edit className="w-3.5 h-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {applications.length} applications
        </div>
      </div>

      {/* Manage Modal */}
      {selectedApp && (
        <div className="modal-backdrop">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Manage Application</h2>
                <p className="text-xs text-gray-500 mt-0.5">#{String(selectedApp.id).padStart(5,'0')} · {selectedApp.scheme_title}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Citizen Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                <p className="font-semibold text-gray-700 mb-1">{selectedApp.citizen_name}</p>
                <p className="text-gray-500 text-xs">{selectedApp.citizen_email}</p>
              </div>

              {/* Status */}
              <div>
                <label className="label-text">Update Status</label>
                <select className="input-field" value={statusUpdate.status} onChange={e => setStatusUpdate({...statusUpdate, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="label-text">Admin Note</label>
                <textarea className="input-field py-2.5" rows="3" placeholder="Reason for rejection or internal notes..." value={statusUpdate.admin_note} onChange={e => setStatusUpdate({...statusUpdate, admin_note: e.target.value})} />
              </div>

              <button onClick={handleUpdateStatus} disabled={updating} className="btn-primary w-full py-2.5">
                {updating && !uploadProgress ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Status'}
              </button>

              {/* Upload Result */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-bold text-gray-900 mb-1 text-sm">Upload Certificate / Result</h3>
                <p className="text-xs text-gray-400 mb-4">Upload the approved document. This will auto-approve the application.</p>

                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${dragActive ? 'border-accent bg-accent-50 scale-[1.01]' : 'border-gray-200 bg-gray-50 hover:border-accent hover:bg-accent-50/50'}
                    ${updating ? 'opacity-60 pointer-events-none' : ''}`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleUploadResult(e.target.files[0])} />
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${dragActive ? 'text-accent' : 'text-gray-400'}`} />
                  <p className="text-sm font-semibold text-gray-600">
                    <span className="text-accent">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                </div>

                {updating && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Uploading certificate...</span><span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-accent h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
