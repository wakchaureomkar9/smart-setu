import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FileText, Trash2, Download, Upload, X, Vault,
  Shield, Image, File, FileArchive, CloudUpload,
  CheckCircle2, AlertCircle
} from 'lucide-react';

const docTypes = [
  'Aadhaar Card', 'PAN Card', 'Income Certificate', 'Caste Certificate',
  'Domicile Certificate', 'Ration Card', 'Birth Certificate', 'Passport', 'Other'
];

const getFileIcon = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return Image;
  if (ext === 'pdf') return FileText;
  if (['zip','rar','7z'].includes(ext)) return FileArchive;
  return File;
};

const getFileColor = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return { bg: 'bg-purple-50', color: 'text-purple-600' };
  if (ext === 'pdf') return { bg: 'bg-red-50', color: 'text-red-600' };
  return { bg: 'bg-blue-50', color: 'text-blue-600' };
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="h-4 bg-gray-100 rounded w-24" />
      </div>
    </div>
    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
      <div className="h-8 bg-gray-100 rounded-lg w-16" />
      <div className="h-8 bg-gray-100 rounded-lg w-16" />
    </div>
  </div>
);

const DocumentVault = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [docType, setDocType] = useState('Aadhaar Card');
  const [dragActive, setDragActive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    setUploading(true);
    setUploadProgress(0);
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      toast.success('Document uploaded successfully! ✅');
      fetchDocuments();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => handleUpload(e.target.files[0]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted');
      setDocuments(prev => prev.filter(d => d.id !== id));
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Vault className="w-7 h-7 text-primary" />
            Document Vault
          </h1>
          <p className="text-gray-500 text-sm mt-1">Securely store documents for use in scheme applications.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-3 py-1.5">
          <Shield className="w-4 h-4" />
          <span className="font-semibold">256-bit Encrypted Storage</span>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CloudUpload className="w-5 h-5 text-accent" /> Upload Document
        </h2>

        {/* Doc Type Selector */}
        <div className="mb-4">
          <label className="label-text">Document Type</label>
          <select
            value={docType}
            onChange={e => setDocType(e.target.value)}
            className="input-field"
          >
            {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${dragActive ? 'border-accent bg-accent-50 scale-[1.01]' : 'border-gray-200 bg-gray-50 hover:border-accent hover:bg-accent-50/50'}
            ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
              ${dragActive ? 'bg-accent text-white' : 'bg-white text-accent shadow-sm border border-gray-100'}`}>
              <CloudUpload className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                <span className="text-accent">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span className="font-medium">Uploading {docType}...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Stored Documents
            {!loading && <span className="ml-2 text-sm font-normal text-gray-400">({documents.length})</span>}
          </h2>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-gray-700 font-bold mb-1">No documents uploaded yet</h3>
            <p className="text-gray-400 text-sm mb-5">Upload your first document using the form above.</p>
            <button onClick={() => fileInputRef.current?.click()} className="btn-outline">Browse Files</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => {
              const FileIcon = getFileIcon(doc.file_name);
              const { bg, color } = getFileColor(doc.file_name);
              return (
                <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-primary-100 transition-all duration-200 group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>
                      <FileIcon className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate" title={doc.file_name}>{doc.file_name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">{doc.doc_type}</span>
                        <span className="text-xs text-gray-400">{formatFileSize(doc.file_size)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(doc.uploaded_at || Date.now()).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1 mb-4 border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="font-semibold">Stored in Vault</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <a
                      href={`http://localhost:5000${doc.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-xl transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button
                      onClick={() => setDeleteConfirm(doc)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-backdrop">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Document?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will permanently delete <strong className="text-gray-700">{deleteConfirm.file_name}</strong> from your vault.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-ghost border border-gray-200">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
