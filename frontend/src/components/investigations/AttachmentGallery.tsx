'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  investigationsApi,
  type InvestigationAttachment,
} from '@/lib/investigations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Paperclip,
  Upload,
  Trash2,
  Download,
  Image as ImageIcon,
  FileText,
  Loader2,
  Pencil,
} from 'lucide-react';

interface AttachmentGalleryProps {
  investigationId: string;
  onAnnotate?: (attachment: InvestigationAttachment) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(ct: string): boolean {
  return (ct || '').startsWith('image/');
}

export function AttachmentGallery({ investigationId, onAnnotate }: AttachmentGalleryProps) {
  const [attachments, setAttachments] = useState<InvestigationAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = useCallback(async () => {
    try {
      const data = await investigationsApi.listAttachments(investigationId);
      setAttachments(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [investigationId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await investigationsApi.uploadAttachment(investigationId, file);
      await fetchAttachments();
    } catch {
      // ignore
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!window.confirm('Delete this attachment?')) return;
    setDeleting(attachmentId);
    try {
      await investigationsApi.deleteAttachment(investigationId, attachmentId);
      await fetchAttachments();
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-brand-800 border border-[#1F2937] rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2937]">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-accent-500" />
          <h3 className="text-sm font-semibold text-white">Attachments</h3>
          <Badge variant="outline" className="text-[10px]">{attachments.length}</Badge>
        </div>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <Button
            size="sm"
            variant="ghost"
            className="text-[#94A3B8] hover:text-white"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
            Upload
          </Button>
        </div>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-[#64748B]" />
          </div>
        ) : attachments.length === 0 ? (
          <p className="text-xs text-[#64748B] text-center py-6">No attachments yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {attachments.map((att) => (
              <div key={att.id} className="bg-[#0F1A2E] rounded-lg border border-[#1F2937] overflow-hidden">
                {isImage(att.content_type) && att.file_url ? (
                  <div className="relative h-24 bg-[#0a1020]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={att.file_url} alt={att.filename} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center bg-[#0a1020]">
                    {isImage(att.content_type) ? (
                      <ImageIcon className="w-8 h-8 text-[#374151]" />
                    ) : (
                      <FileText className="w-8 h-8 text-[#374151]" />
                    )}
                  </div>
                )}

                <div className="p-2">
                  <p className="text-[11px] text-white truncate" title={att.filename}>{att.filename}</p>
                  <p className="text-[10px] text-[#64748B]">{formatBytes(att.file_size)} · {new Date(att.created_at).toLocaleDateString()}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {att.file_url && (
                      <a href={att.file_url} download={att.filename} className="text-[10px] text-accent-500 hover:text-accent-400 flex items-center gap-0.5">
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                    {isImage(att.content_type) && onAnnotate && (
                      <button onClick={() => onAnnotate(att)} className="text-[10px] text-[#94A3B8] hover:text-white flex items-center gap-0.5">
                        <Pencil className="w-3 h-3" /> Annotate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(att.id)}
                      disabled={deleting === att.id}
                      className="text-[10px] text-[#64748B] hover:text-danger flex items-center gap-0.5 ml-auto"
                    >
                      {deleting === att.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
