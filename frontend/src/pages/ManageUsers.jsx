import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Search, Mail, Phone, Calendar, FileText, Shield } from 'lucide-react';

const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-xl" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="h-3 bg-gray-100 rounded w-48" />
    </div>
    <div className="h-6 bg-gray-200 rounded w-20" />
  </div>
);

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/admin/users');
        setUsers(res.data);
      } catch {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" /> Manage Users
        </h1>
        <p className="text-gray-500 text-sm mt-1">View and manage registered citizen accounts.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" className="input-field pl-10 py-2" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Citizen</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applications</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 text-primary rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400 font-mono">ID #{String(u.id).padStart(4,'0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Mail className="w-3.5 h-3.5" />{u.email}
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone className="w-3.5 h-3.5" />{u.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {u.application_count ?? 0}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="badge-approved"><Shield className="w-3 h-3" />Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">{filtered.length} of {users.length} citizens</div>
      </div>
    </div>
  );
};

export default ManageUsers;
