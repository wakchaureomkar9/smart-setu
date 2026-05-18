import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Search, Info, BookOpen, ShieldCheck, ArrowRight,
  X, Loader2, Filter, Building2
} from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-20 mb-3" />
    <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-full mb-1" />
    <div className="h-4 bg-gray-100 rounded w-3/4 mb-6" />
    <div className="flex justify-between">
      <div className="h-8 bg-gray-100 rounded w-24" />
      <div className="h-8 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

const Schemes = () => {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => { fetchSchemes(); }, []);

  const fetchSchemes = async () => {
    try {
      const res = await api.get('/schemes');
      setSchemes(res.data);
    } catch {
      toast.error('Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (schemeId) => {
    setApplying(true);
    try {
      await api.post('/applications', { scheme_id: schemeId });
      toast.success('Application submitted successfully! 🎉');
      setSelectedScheme(null);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to apply';
      if (error.response?.data?.missing) {
        toast.error(`${msg}. Missing docs: ${error.response.data.missing.join(', ')}`, { duration: 6000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setApplying(false);
    }
  };

  const departments = ['all', ...new Set(schemes.map(s => s.department))];

  const filtered = schemes.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === 'all' || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  const getRequiredDocs = (scheme) => {
    try {
      return Array.isArray(scheme.required_docs)
        ? scheme.required_docs
        : JSON.parse(scheme.required_docs || '[]');
    } catch { return []; }
  };

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent-50 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-4">
          <BookOpen className="w-4 h-4" />
          Government Schemes
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Discover & Apply</h1>
        <p className="text-gray-500">Browse available government schemes and apply digitally. Ensure required documents are in your vault.</p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search schemes or departments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="input-field py-2 w-auto"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {!loading && (
        <div className="text-sm text-gray-500">
          Showing <strong className="text-gray-900">{filtered.length}</strong> of {schemes.length} schemes
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-700 font-bold mb-1">No schemes found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(scheme => {
            const docs = getRequiredDocs(scheme);
            return (
              <div
                key={scheme.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col hover:shadow-md hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent bg-accent-50 px-2.5 py-1 rounded-lg mb-3">
                    <Building2 className="w-3 h-3" />{scheme.department}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                    {scheme.title}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>
                <div className="mb-4">
                  <div className="text-xs text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Required Documents
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {docs.slice(0, 3).map((doc, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">{doc}</span>
                    ))}
                    {docs.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">+{docs.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center gap-2">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-sm font-semibold text-primary hover:text-accent flex items-center gap-1.5 transition-colors"
                  >
                    <Info className="w-4 h-4" /> Details
                  </button>
                  {user?.role === 'citizen' && (
                    <button
                      onClick={() => handleApply(scheme.id)}
                      disabled={applying}
                      className="btn-primary py-1.5 px-4 text-xs"
                    >
                      Apply Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <div className="modal-backdrop" onClick={() => setSelectedScheme(null)}>
          <div className="modal-panel max-w-lg overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedScheme(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>

            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent bg-accent-50 px-2.5 py-1 rounded-lg mb-3">
              <Building2 className="w-3 h-3" />{selectedScheme.department}
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4 pr-8 leading-tight">{selectedScheme.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{selectedScheme.description}</p>

            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-primary text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Required Documents
              </h4>
              <ul className="space-y-2">
                {getRequiredDocs(selectedScheme).map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {user?.role === 'citizen' ? (
              <button
                onClick={() => handleApply(selectedScheme.id)}
                disabled={applying}
                className="btn-primary w-full py-3"
              >
                {applying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying...</> : <>Submit Application <ArrowRight className="w-4 h-4 ml-1" /></>}
              </button>
            ) : !user ? (
              <a href="/login" className="btn-primary w-full py-3 text-center block">Login to Apply</a>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
