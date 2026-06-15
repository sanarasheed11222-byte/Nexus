import React, { useEffect, useState, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { documentService } from '../../services/documentService';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await documentService.uploadDocument(file, file.name);
      toast.success('Document uploaded successfully!');
      loadDocuments();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted!');
      loadDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = (fileUrl: string) => {
    window.open('http://localhost:5000' + fileUrl, '_blank');
  };

  const handleShare = (fileUrl: string, title: string) => {
    navigator.clipboard.writeText('http://localhost:5000' + fileUrl);
    toast.success('Link copied to clipboard!');
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and share your important files</p>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        <Button leftIcon={<Upload size={18} />} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              <p className="text-sm text-gray-500">Total Documents</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{documents.filter(d => d.status === 'signed').length}</p>
              <p className="text-sm text-gray-500">Signed</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <FileText size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{documents.filter(d => d.status === 'pending').length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <FileText size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
              <p className="text-gray-500 mt-1">Upload your first document to get started</p>
              <Button className="mt-4" leftIcon={<Upload size={18} />} onClick={() => fileInputRef.current?.click()}>
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map(doc => (
                <div key={doc._id} className="flex items-center py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors group">
                  <div className="p-3 bg-gray-50 rounded-lg mr-4">
                    <FileText size={24} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{doc.title}</h3>
                      <Badge variant={doc.status === 'signed' ? 'success' : 'secondary'} size="sm">{doc.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="uppercase font-medium">{doc.fileType?.split('/')[1] || 'FILE'}</span>
                      <span>•</span>
                      <span>{formatSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>By {doc.uploadedBy?.name}</span>
                      <span>•</span>
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="ghost" size="sm" className="p-2 hover:bg-blue-50 hover:text-blue-600" title="Download" onClick={() => handleDownload(doc.fileUrl)}>
                      <Download size={18} />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 hover:bg-green-50 hover:text-green-600" title="Share" onClick={() => handleShare(doc.fileUrl, doc.title)}>
                      <Share2 size={18} />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 hover:bg-red-50 hover:text-red-600" title="Delete" onClick={() => handleDelete(doc._id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
