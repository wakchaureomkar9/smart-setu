import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, BookOpen, Search, ShieldCheck } from 'lucide-react';

const ManageSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [formData, setFormData] = useState({ title: '', department: '', description: '', required_docs: '' });
  const [saving, setSaving] = useState(false);

  const fetchSchemes = async () => {
    try {
      const res = await api.get('/schemes');
      setSchemes(res.data);
    } catch { toast.error('Failed to load schemes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchemes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedDocs = formData.required_docs.split(',').map(d => d.trim()).filter(Boolean);
    if (!parsedDocs.length) return toast.error('Please add at least one required document');
    setSaving(true);
    try {
      const payload = { ...formData, required_docs: parsedDocs };
      if (editingScheme) {
        await api.put(`/schemes/${editingScheme.id}`, payload);
        toast.success('Scheme updated');
      } else {
        await api.post('/schemes', payload);
        toast.success('Scheme created');
      }
      setIsModalOpen(false);
      fetchSchemes();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to save scheme');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheme?')) return;
    try {
      await api.delete(`/schemes/${id}`);
      toast.success('Scheme deleted');
      fetchSchemes();
    } catch { toast.error('Failed to delete scheme'); }
  };

  const openEditModal = (scheme) => {
    setEditingScheme(scheme);
    const docs = Array.isArray(scheme.required_docs)
      ? scheme.required_docs.join(', ')
      : JSON.parse(scheme.required_docs || '[]').join(', ');
    setFormData({ title: scheme.title, department: scheme.department, description: scheme.description, required_docs: docs });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingScheme(null);
    setFormData({ title: '', department: '', description: '', required_docs: '' });
    setIsModalOpen(true);
  };

  const filtered = schemes.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><BookOpen className="w-7 h-7 text-primary" />Manage Schemes</h1>
          <p className="text-gray-500 text-sm mt-1">Create, edit, and manage government schemes.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary shrink-0">
          <Plus className="w-4 h-4 mr-2" /> New Scheme
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" className="input-field pl-10 py-2" placeholder="Search schemes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No schemes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheme</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Req. Docs</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(scheme => {
                  const docs = Array.isArray(scheme.required_docs) ? scheme.required_docs : JSON.parse(scheme.required_docs || '[]');
                  return (
                    <tr key={scheme.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-semibold text-gray-900">{scheme.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{scheme.description}</p>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-xs font-semibold bg-accent-50 text-accent px-2 py-0.5 rounded-lg">{scheme.department}</span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1">
                          {docs.slice(0,2).map((d, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{d}</span>)}
                          {docs.length > 2 && <span className="text-xs text-gray-400">+{docs.length-2}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(scheme)} className="p-2 text-primary bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(scheme.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">{filtered.length} of {schemes.length} schemes</div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500"><X className="w-4 h-4" /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-5">{editingScheme ? 'Edit Scheme' : 'Create New Scheme'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Scheme Title</label>
                <input type="text" className="input-field" required placeholder="e.g. PM Awas Yojana" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Department</label>
                <input type="text" className="input-field" required placeholder="e.g. Ministry of Housing" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea className="input-field py-2.5" rows="3" required placeholder="Brief description of the scheme..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="label-text flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent" />Required Documents <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                <input type="text" className="input-field" required placeholder="Aadhaar Card, Income Certificate, PAN Card" value={formData.required_docs} onChange={e => setFormData({...formData, required_docs: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5">
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editingScheme ? 'Update Scheme' : 'Create Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchemes;
