import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import {
  FileBadge, FileText, Clock, ArrowRight, BookOpen, Vault,
  TrendingUp, CheckCircle2, XCircle, Upload, ChevronRight,
  Bell, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, bg, border, sub }) => (
  <div className={`bg-white rounded-2xl border ${border} p-5 hover:shadow-md transition-all duration-200 group`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs text-gray-400 font-medium">{sub}</span>
    </div>
    <div className="text-3xl font-extrabold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-500 font-medium">{label}</div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
    </div>
    <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-28" />
  </div>
);

const statusConfig = {
  pending: { label: 'Pending', color: 'badge-pending' },
  in_progress: { label: 'In Progress', color: 'badge-in-progress' },
  approved: { label: 'Approved', color: 'badge-approved' },
  rejected: { label: 'Rejected', color: 'badge-rejected' },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/auth/dashboard/stats');
        setStats(res.data.stats);
        setRecentApps(res.data.recentApplications);
      } catch {
        // Fallback to basic API
        try {
          const res = await api.get('/applications');
          const apps = res.data;
          setStats({
            totalApplications: apps.length,
            approved: apps.filter(a => a.status === 'approved').length,
            pending: apps.filter(a => a.status === 'pending').length,
            in_progress: apps.filter(a => a.status === 'in_progress').length,
            rejected: apps.filter(a => a.status === 'rejected').length,
            totalDocuments: 0,
          });
          setRecentApps(apps.slice(0, 5));
        } catch {
          toast.error('Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { label: 'Apply for Scheme', icon: BookOpen, to: '/schemes', color: 'text-accent', bg: 'bg-accent-50' },
    { label: 'Upload Document', icon: Upload, to: '/vault', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'My Applications', icon: FileBadge, to: '/applications', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'View Vault', icon: Vault, to: '/vault', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent/15 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="text-primary-300 text-sm font-medium mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Citizen Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-200 text-sm">Manage your documents and applications from here.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/schemes" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-md shadow-accent/25">
              Apply for Scheme <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/vault" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm">
              Upload Document
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Applications" value={stats?.totalApplications ?? 0} icon={FileBadge} color="text-primary" bg="bg-primary-50" border="border-primary-100" sub="All time" />
            <StatCard label="Approved" value={stats?.approved ?? 0} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" sub="Completed" />
            <StatCard label="Pending / In Progress" value={(stats?.pending ?? 0) + (stats?.in_progress ?? 0)} icon={Clock} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" sub="Ongoing" />
            <StatCard label="Documents Uploaded" value={stats?.totalDocuments ?? 0} icon={FileText} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" sub="In vault" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.to}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-gray-900">Recent Applications</h2>
          </div>
          <Link to="/applications" className="text-sm font-semibold text-accent hover:text-accent-700 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : recentApps.length === 0 ? (
          <div className="text-center py-14 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileBadge className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-semibold mb-1">No applications yet</h3>
            <p className="text-gray-400 text-sm mb-5">Start by applying for a government scheme.</p>
            <Link to="/schemes" className="btn-accent">Browse Schemes</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentApps.map(app => {
              const cfg = statusConfig[app.status] || statusConfig.pending;
              return (
                <div key={app.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{app.scheme_title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      #{String(app.id).padStart(5,'0')} · {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={cfg.color}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Summary */}
      {!loading && stats && stats.totalApplications > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Application Progress Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Approved', value: stats.approved, total: stats.totalApplications, color: 'bg-emerald-500' },
              { label: 'In Progress', value: stats.in_progress, total: stats.totalApplications, color: 'bg-blue-500' },
              { label: 'Pending', value: stats.pending, total: stats.totalApplications, color: 'bg-amber-400' },
              { label: 'Rejected', value: stats.rejected, total: stats.totalApplications, color: 'bg-red-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600 font-medium">{item.label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-8 text-sm font-bold text-gray-900 text-right">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
