import { useCallback, useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  ImagePlus,
  TableIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileImage,
  FileText,
  Check,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { usePages } from '../hooks/usePages';
import { useAutoSave } from '../hooks/useAutoSave';
import { exportToImage, exportToPDF } from '../lib/exportUtils';

const HIGHLIGHT_COLORS = [
  { name: 'Kuning', color: '#ffeaa7' },
  { name: 'Hijau', color: '#55efc4' },
  { name: 'Merah Muda', color: '#fd79a8' },
  { name: 'Biru', color: '#74b9ff' },
];

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notebookId = id ? parseInt(id) : undefined;

  const notebook = useLiveQuery(
    () => (notebookId ? db.notebooks.get(notebookId) : undefined),
    [notebookId]
  );

  const { pages, createPage, updatePage } = usePages(notebookId);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const paperRef = useRef<HTMLDivElement>(null);

  const currentPage = pages[currentPageIndex];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Mulai menulis catatan di sini...',
      }),
    ],
    content: currentPage?.content || '',
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // Load page content when page changes
  useEffect(() => {
    if (currentPage && editor && !editor.isDestroyed) {
      const currentHTML = editor.getHTML();
      if (currentHTML !== currentPage.content) {
        editor.commands.setContent(currentPage.content || '');
        setEditorContent(currentPage.content || '');
      }
    }
  }, [currentPage?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save
  const handleSave = useCallback(
    async (content: string) => {
      if (currentPage?.id) {
        await updatePage(currentPage.id, { content });
        if (notebookId) {
          await db.notebooks.update(notebookId, { updatedAt: new Date() });
        }
      }
    },
    [currentPage?.id, notebookId, updatePage]
  );

  useAutoSave(editorContent, handleSave, 600);

  // Page navigation
  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const addNewPage = async () => {
    if (!notebookId) return;
    await createPage(notebookId, pages.length + 1);
    setCurrentPageIndex(pages.length);
  };

  // Toolbar actions
  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (editor && typeof reader.result === 'string') {
          editor.chain().focus().setImage({ src: reader.result }).run();
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const insertTable = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    setShowExportMenu(false);
    if (!paperRef.current) return;

    try {
      const fileName = notebook?.title || 'note';
      if (format === 'pdf') {
        await exportToPDF(paperRef.current, fileName);
      } else {
        await exportToImage(paperRef.current, format, fileName);
      }
      showToast(`✅ Berhasil mengekspor sebagai ${format.toUpperCase()}`);
    } catch {
      showToast('❌ Gagal mengekspor. Silakan coba lagi.');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => {
      setShowHighlightPicker(false);
      setShowExportMenu(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!notebook) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📓</div>
          <div>Memuat notebook...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="app-header">
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-icon" onClick={() => navigate('/')} title="Kembali ke Library">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'white',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '300px',
                }}
              >
                {notebook.title}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="autosave-indicator">
              <div className="autosave-dot"></div>
              <span>Auto-saved</span>
            </div>

            {/* Page Navigation */}
            <div className="page-indicator">
              <button
                className="page-btn"
                onClick={goToPrevPage}
                disabled={currentPageIndex === 0}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: '#b2bec3', fontSize: '13px', minWidth: '60px', textAlign: 'center' }}>
                {currentPageIndex + 1} / {pages.length}
              </span>
              <button
                className="page-btn"
                onClick={goToNextPage}
                disabled={currentPageIndex >= pages.length - 1}
              >
                <ChevronRight size={16} />
              </button>
              <button
                className="page-btn"
                onClick={addNewPage}
                title="Tambah halaman"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '12px 24px 0' }}>
        <div className="editor-toolbar">
          {/* Text Formatting */}
          <button
            className={`toolbar-btn ${editor?.isActive('bold') ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            className={`toolbar-btn ${editor?.isActive('italic') ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            className={`toolbar-btn ${editor?.isActive('underline') ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </button>

          <div className="toolbar-divider" />

          {/* Text Alignment */}
          <button
            className={`toolbar-btn ${editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            title="Rata Kiri"
          >
            <AlignLeft size={16} />
          </button>
          <button
            className={`toolbar-btn ${editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            title="Rata Tengah"
          >
            <AlignCenter size={16} />
          </button>
          <button
            className={`toolbar-btn ${editor?.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            title="Rata Kanan"
          >
            <AlignRight size={16} />
          </button>

          <div className="toolbar-divider" />

          {/* Highlighter */}
          <div className="highlight-btn" style={{ position: 'relative' }}>
            <button
              className={`toolbar-btn ${editor?.isActive('highlight') ? 'is-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowHighlightPicker(!showHighlightPicker);
                setShowExportMenu(false);
              }}
              title="Stabilo"
            >
              <Highlighter size={16} />
            </button>
            {showHighlightPicker && (
              <div className="highlight-dropdown" onClick={(e) => e.stopPropagation()}>
                {HIGHLIGHT_COLORS.map((hc) => (
                  <div
                    key={hc.color}
                    className="highlight-color"
                    style={{ background: hc.color }}
                    title={hc.name}
                    onClick={() => {
                      editor?.chain().focus().toggleHighlight({ color: hc.color }).run();
                      setShowHighlightPicker(false);
                    }}
                  />
                ))}
                <div
                  className="highlight-color"
                  style={{
                    background: 'transparent',
                    border: '2px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#b2bec3',
                  }}
                  title="Hapus stabilo"
                  onClick={() => {
                    editor?.chain().focus().unsetHighlight().run();
                    setShowHighlightPicker(false);
                  }}
                >
                  ✕
                </div>
              </div>
            )}
          </div>

          <div className="toolbar-divider" />

          {/* Insert */}
          <button
            className="toolbar-btn"
            onClick={insertImage}
            title="Sisipkan Gambar"
          >
            <ImagePlus size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={insertTable}
            title="Sisipkan Tabel"
          >
            <TableIcon size={16} />
          </button>

          <div style={{ flex: 1 }} />

          {/* Export */}
          <div style={{ position: 'relative' }}>
            <button
              className="toolbar-btn"
              style={{ width: 'auto', padding: '0 12px', gap: '6px', display: 'flex' }}
              onClick={(e) => {
                e.stopPropagation();
                setShowExportMenu(!showExportMenu);
                setShowHighlightPicker(false);
              }}
              title="Ekspor"
            >
              <Download size={16} />
              <span style={{ fontSize: '13px' }}>Ekspor</span>
            </button>
            {showExportMenu && (
              <div className="export-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="export-item" onClick={() => handleExport('png')}>
                  <FileImage size={16} />
                  Ekspor PNG
                </button>
                <button className="export-item" onClick={() => handleExport('jpg')}>
                  <FileImage size={16} />
                  Ekspor JPG
                </button>
                <button className="export-item" onClick={() => handleExport('pdf')}>
                  <FileText size={16} />
                  Ekspor PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paper Area */}
      <div className="paper-container">
        <div className="paper-scale-wrapper">
          <div ref={paperRef} className="notebook-paper">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <Check size={16} color="#00b894" />
          {toast}
        </div>
      )}
    </div>
  );
}
