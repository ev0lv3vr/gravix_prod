'use client';

/**
 * PhotoAnnotation — Fabric.js canvas overlay for image annotation.
 *
 * NOTE: Must be dynamically imported with ssr:false.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { investigationsApi, type InvestigationAttachment } from '@/lib/investigations';
import {
  X,
  Undo2,
  Redo2,
  Pencil,
  Circle,
  Square,
  Type,
  MoveRight,
  Save,
  Loader2,
} from 'lucide-react';

type FabricCanvas = import('fabric').Canvas;

type Tool = 'draw' | 'circle' | 'rect' | 'arrow' | 'text';

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
];

interface PhotoAnnotationProps {
  attachment: InvestigationAttachment;
  investigationId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function PhotoAnnotation({ attachment, investigationId, onClose, onSaved }: PhotoAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('draw');
  const [activeColor, setActiveColor] = useState('#ef4444');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const pushHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    setHistory((prev) => {
      const next = [...prev.slice(0, historyIdx + 1), json].slice(-20);
      setHistoryIdx(next.length - 1);
      return next;
    });
  }, [historyIdx]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const fabric = await import('fabric');
      if (cancelled || !canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        width: 800,
        height: 600,
      });
      fabricRef.current = canvas;

      // Load background image
      if (attachment.file_url) {
        try {
          const img = await fabric.FabricImage.fromURL(attachment.file_url, { crossOrigin: 'anonymous' });
          const scale = Math.min(800 / (img.width || 800), 600 / (img.height || 600));
          canvas.width = (img.width || 800) * scale;
          canvas.height = (img.height || 600) * scale;
          canvas.backgroundImage = img;
          img.scaleX = scale;
          img.scaleY = scale;
          canvas.renderAll();
        } catch {
          // ignore
        }
      }

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = '#ef4444';
        canvas.freeDrawingBrush.width = 3;
      }

      const initial = JSON.stringify(canvas.toJSON());
      setHistory([initial]);
      setHistoryIdx(0);
      setLoaded(true);

      const c = canvas as unknown as Record<string, boolean>;
      canvas.on('object:added', () => {
        if (!c.__undoing) pushHistory();
      });
      canvas.on('path:created', () => {
        pushHistory();
      });
    })();

    return () => {
      cancelled = true;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment.file_url]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
    }
  }, [activeColor]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = activeTool === 'draw';
  }, [activeTool]);

  const addShape = useCallback(async (tool: Tool) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const fabric = await import('fabric');

    canvas.isDrawingMode = false;

    if (tool === 'circle') {
      canvas.add(new fabric.Circle({ radius: 40, left: 100, top: 100, fill: 'transparent', stroke: activeColor, strokeWidth: 3 }));
    } else if (tool === 'rect') {
      canvas.add(new fabric.Rect({ width: 120, height: 70, left: 100, top: 100, fill: 'transparent', stroke: activeColor, strokeWidth: 3 }));
    } else if (tool === 'arrow') {
      const line = new fabric.Line([100, 100, 260, 100], { stroke: activeColor, strokeWidth: 3 });
      const head = new fabric.Triangle({ width: 14, height: 14, fill: activeColor, left: 260, top: 93, angle: 90 });
      canvas.add(new fabric.Group([line, head], { left: 0, top: 0 }));
    } else if (tool === 'text') {
      canvas.add(new fabric.IText('Label', { left: 100, top: 100, fontSize: 20, fill: activeColor, fontFamily: 'Arial' }));
    }

    canvas.renderAll();
  }, [activeColor]);

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);
    if (tool !== 'draw') addShape(tool);
  };

  const undo = useCallback(() => {
    if (historyIdx <= 0 || !fabricRef.current) return;
    const newIdx = historyIdx - 1;
    const canvas = fabricRef.current;
    const c = canvas as unknown as Record<string, boolean>;
    c.__undoing = true;
    canvas.loadFromJSON(JSON.parse(history[newIdx])).then(() => {
      canvas.renderAll();
      c.__undoing = false;
      setHistoryIdx(newIdx);
    });
  }, [history, historyIdx]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1 || !fabricRef.current) return;
    const newIdx = historyIdx + 1;
    const canvas = fabricRef.current;
    const c = canvas as unknown as Record<string, boolean>;
    c.__undoing = true;
    canvas.loadFromJSON(JSON.parse(history[newIdx])).then(() => {
      canvas.renderAll();
      c.__undoing = false;
      setHistoryIdx(newIdx);
    });
  }, [history, historyIdx]);

  const handleSave = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.9, multiplier: 1 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const baseName = attachment.filename.replace(/\.[^.]+$/, '');
      const file = new File([blob], `${baseName}_annotated.jpg`, { type: 'image/jpeg' });
      await investigationsApi.uploadAttachment(investigationId, file);
      onSaved();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-brand-800 rounded-lg border border-[#1F2937] max-w-[900px] w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2937]">
          <h3 className="text-sm font-semibold text-white">Annotate: {attachment.filename}</h3>
          <button onClick={onClose} className="text-[#64748B] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1F2937] flex-wrap">
          <Button size="sm" variant={activeTool === 'draw' ? 'default' : 'ghost'} className="text-xs" onClick={() => handleToolClick('draw')}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Draw
          </Button>
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleToolClick('circle')}>
            <Circle className="w-3.5 h-3.5 mr-1" /> Circle
          </Button>
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleToolClick('rect')}>
            <Square className="w-3.5 h-3.5 mr-1" /> Rect
          </Button>
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleToolClick('arrow')}>
            <MoveRight className="w-3.5 h-3.5 mr-1" /> Arrow
          </Button>
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleToolClick('text')}>
            <Type className="w-3.5 h-3.5 mr-1" /> Text
          </Button>

          <div className="w-px h-5 bg-[#1F2937] mx-1" />

          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveColor(c.value)}
              className={`w-5 h-5 rounded-full border-2 ${activeColor === c.value ? 'border-white' : 'border-transparent'}`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}

          <div className="w-px h-5 bg-[#1F2937] mx-1" />

          <Button size="sm" variant="ghost" className="text-xs" onClick={undo} disabled={historyIdx <= 0}>
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="text-xs" onClick={redo} disabled={historyIdx >= history.length - 1}>
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center justify-center p-4 bg-[#0a1020] overflow-auto relative">
          {!loaded && <Loader2 className="w-8 h-8 animate-spin text-[#64748B]" />}
          <canvas ref={canvasRef} />
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#1F2937]">
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-accent-500 hover:bg-accent-600 text-white" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save Annotated
          </Button>
        </div>
      </div>
    </div>
  );
}
