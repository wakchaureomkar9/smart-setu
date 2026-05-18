import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Download, Search, CheckCircle2, XCircle, Clock, FileBadge,
  Filter, SortDesc, ArrowRight, FileText, BookOpen, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
  pending:     { label: 'Pending',     cls: 'badge-pending',     icon: Clock },
  in_progress: { label: 'In Progress', cls: 'badge-in-progress', icon: Clock },
  approved:    { label: 'Approved',    cls: 'badge-approved',    icon: CheckCircle2 },
  rejected:    { label: 'Rejected',    cls: 'badge-rejected',    icon: XCircle },
};

const SkeletonRow = () => (
  <div className="flex flex-col sm:flex-row gap-4 p-5 bg-white rounded-2xl border border-gray-100 animate-pulse">
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-gray-200 rounded w-48" />
      <div className="h-4 bg-gray-100 rounded w-32" />
    </div>
    <div className="h-6 bg-gray-200 rounded w-20" />
  </div>
);

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (appId) => {
    setDownloading(appId);
    const toastId = toast.loading('Preparing download...');
    try {
      const response = await api.get(`/applications/${appId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${appId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!', { id: toastId });
    } catch {
      toast.error('Failed to download document', { id: toastId });
    } finally {
      setDownloading(null);
    }
  };

  const filtered = applications
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .filter(a =>
      a.scheme_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a.id).includes(searchTerm)
    );

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    const Icon = cfg.icon;
    return (
      <span className={cfg.cls}>
        <Icon className="w-3 h-3" /> {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <FileBadge className="w-7 h-7 text-primary" />
            My Applications
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all your scheme applications.</p>
        </div>
        <Link to="/schemes" className="btn-accent shrink-0">
          <BookOpen className="w-4 h-4 mr-2" /> Browse Schemes
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10 py-2"
            placeholder="Search by scheme name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field py-2 w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <div className="text-sm text-gray-500">
          Showing <strong className="text-gray-900">{filtered.length}</strong> of {applications.length} applications
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FileBadge className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {applications.length === 0 ? 'No applications yet' : 'No results found'}
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            {applications.length === 0
              ? "You haven't applied for any schemes yet."
              : 'Try adjusting your search or filter.'}
          </p>
          {applications.length === 0 && (
            <Link to="/schemes" className="btn-accent">
              Browse Schemes <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const cfg = statusConfig[app.status] || statusConfig.pending;
            const Icon = cfg.icon;
            const isDownloading = downloading === app.id;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-100 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-tight">{app.scheme_title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 font-mono">#{String(app.id).padStart(5,'0')}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {app.admin_note && (
                      <div className="mt-3 ml-13 pl-1">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-700">
                          <span className="font-semibold">Admin Note: </span>{app.admin_note}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cfg.cls}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>

                    {app.status === 'approved' && app.result_file_url ? (
                      <button
                        onClick={() => handleDownload(app.id)}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-60"
                      >
                        {isDownloading ? (
                          <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        Certificate
                      </button>
                    ) : app.status === 'approved' ? (
                      <span className="text-xs text-gray-400 italic">Processing...</span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
