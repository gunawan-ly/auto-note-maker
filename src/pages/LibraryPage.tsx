import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  BookOpen,
  Pencil,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useNotebooks } from '../hooks/useNotebooks';

const COVER_COLORS = [
  'linear-gradient(135deg, #6c5ce7, #a29bfe)',
  'linear-gradient(135deg, #e17055, #fab1a0)',
  'linear-gradient(135deg, #00b894, #55efc4)',
  'linear-gradient(135deg, #0984e3, #74b9ff)',
  'linear-gradient(135deg, #fd79a8, #e84393)',
  'linear-gradient(135deg, #fdcb6e, #f39c12)',
  'linear-gradient(135deg, #636e72, #b2bec3)',
  'linear-gradient(135deg, #2d3436, #636e72)',
  'linear-gradient(135deg, #e84393, #6c5ce7)',
  'linear-gradient(135deg, #00cec9, #0984e3)',
];

const COVER_EMOJIS = [
  '📓', '📕', '📗', '📘', '📙', '📔',
  '📚', '✏️', '🎓', '💡', '🔬', '🎨',
  '📝', '🌟', '🚀', '🎯', '💻', '🧠',
];

export function LibraryPage() {
  const navigate = useNavigate();
  const { notebooks, createNotebook, updateNotebook, deleteNotebook } =
    useNotebooks();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);

  // Create dialog state
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState(COVER_COLORS[0]);
  const [newEmoji, setNewEmoji] = useState(COVER_EMOJIS[0]);
  const [newCoverImage, setNewCoverImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit dialog state
  const [editTitle, setEditTitle] = useState('');

  const filteredNotebooks = useMemo(
    () =>
      notebooks.filter((nb) =>
        nb.title.toLowerCase().includes(search.toLowerCase())
      ),
    [notebooks, search]
  );

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    setNewCoverImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const id = await createNotebook(newTitle.trim(), newColor, newEmoji, newCoverImage);
    setNewTitle('');
    setNewColor(COVER_COLORS[0]);
    setNewEmoji(COVER_EMOJIS[0]);
    setNewCoverImage(undefined);
    setShowCreateDialog(false);
    navigate(`/notebook/${id}`);
  };

  const handleEdit = async () => {
    if (showEditDialog === null || !editTitle.trim()) return;
    await updateNotebook(showEditDialog, { title: editTitle.trim() });
    setShowEditDialog(null);
    setEditTitle('');
  };

  const handleDelete = async () => {
    if (showDeleteDialog === null) return;
    await deleteNotebook(showDeleteDialog);
    setShowDeleteDialog(null);
  };

  const openEditDialog = (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation();
    setEditTitle(title);
    setShowEditDialog(id);
  };

  const openDeleteDialog = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setShowDeleteDialog(id);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="app-header">
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={28} color="#6c5ce7" />
            <h1
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Auto Note Maker
            </h1>
          </div>
          <button
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus size={18} />
            Buku Baru
          </button>
        </div>
      </header>

      {/* Controls */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Cari notebook..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Notebooks */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', flex: 1 }}>
        {filteredNotebooks.length === 0 && !search ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">Belum ada notebook</div>
            <div className="empty-state-desc">
              Mulai buat notebook pertamamu dan tulis catatan dengan tampilan
              buku tulis yang indah!
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus size={18} />
              Buat Notebook
            </button>
          </div>
        ) : filteredNotebooks.length === 0 && search ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Tidak ditemukan</div>
            <div className="empty-state-desc">
              Tidak ada notebook dengan kata kunci "{search}"
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredNotebooks.map((nb) => (
              <div
                key={nb.id}
                className="glass-card notebook-card"
                onClick={() => navigate(`/notebook/${nb.id}`)}
              >
                <div className="notebook-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => openEditDialog(e, nb.id!, nb.title)}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={(e) => openDeleteDialog(e, nb.id!)}
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div
                  className="notebook-cover"
                  style={{
                    background: nb.coverImage ? `url(${nb.coverImage}) center/cover no-repeat` : nb.coverColor,
                  }}
                >
                  <span className="cover-emoji">{nb.coverEmoji}</span>
                  <div className="cover-title">{nb.title}</div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div
                    style={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {nb.title}
                  </div>
                  <div
                    style={{
                      color: '#636e72',
                      fontSize: '0.8rem',
                    }}
                  >
                    {formatDate(nb.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredNotebooks.map((nb) => (
              <div
                key={nb.id}
                className="glass-card"
                onClick={() => navigate(`/notebook/${nb.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 20px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: nb.coverImage ? `url(${nb.coverImage}) center/cover no-repeat` : nb.coverColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                  }}
                >
                  {nb.coverEmoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      color: 'white',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {nb.title}
                  </div>
                  <div style={{ color: '#636e72', fontSize: '0.8rem' }}>
                    {formatDate(nb.updatedAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    className="action-btn"
                    onClick={(e) => openEditDialog(e, nb.id!, nb.title)}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={(e) => openDeleteDialog(e, nb.id!)}
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px', textAlign: 'center' }}>
          <p style={{ color: '#636e72', fontSize: '0.85rem', margin: 0 }}>
            © {new Date().getFullYear()} <span style={{ color: '#a29bfe', fontWeight: 600 }}>Auto Note Maker</span>. All rights reserved.
          </p>
          <p style={{ color: '#4a5568', fontSize: '0.75rem', marginTop: '4px' }}>
            Developed by <span style={{ color: '#fd79a8', fontWeight: 600 }}>Awanophile</span>
          </p>
        </div>
      </footer>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="dialog-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="dialog-content dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">📓 Buat Notebook Baru</div>

            <label style={{ color: '#b2bec3', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
              Judul
            </label>
            <input
              className="dialog-input"
              placeholder="Contoh: Catatan Matematika"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />

            {/* Cover Photo Upload */}
            <label style={{ color: '#b2bec3', fontSize: '13px', fontWeight: 500, marginTop: '20px', marginBottom: '6px', display: 'block' }}>
              Foto Sampul (opsional)
            </label>
            {newCoverImage ? (
              <div className="cover-preview-container">
                <img src={newCoverImage} alt="Cover preview" className="cover-preview-img" />
                <button className="cover-preview-remove" onClick={removeCoverImage}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                className="cover-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} />
                <span>Upload Foto Sampul</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverUpload}
            />

            <label style={{ color: '#b2bec3', fontSize: '13px', fontWeight: 500, marginTop: '20px', marginBottom: '6px', display: 'block' }}>
              {newCoverImage ? 'Warna Cadangan' : 'Warna Sampul'}
            </label>
            <div className="color-grid">
              {COVER_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-option ${newColor === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setNewColor(c)}
                />
              ))}
            </div>

            <label style={{ color: '#b2bec3', fontSize: '13px', fontWeight: 500, marginTop: '8px', marginBottom: '6px', display: 'block' }}>
              Emoji Sampul
            </label>
            <div className="emoji-grid">
              {COVER_EMOJIS.map((e) => (
                <div
                  key={e}
                  className={`emoji-option ${newEmoji === e ? 'selected' : ''}`}
                  onClick={() => setNewEmoji(e)}
                >
                  {e}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              <button className="btn-secondary" onClick={() => setShowCreateDialog(false)}>
                Batal
              </button>
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                style={{ opacity: newTitle.trim() ? 1 : 0.5 }}
              >
                Buat Notebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog !== null && (
        <div className="dialog-overlay" onClick={() => setShowEditDialog(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">✏️ Edit Judul</div>
            <input
              className="dialog-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              autoFocus
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              <button className="btn-secondary" onClick={() => setShowEditDialog(null)}>
                Batal
              </button>
              <button className="btn-primary" onClick={handleEdit}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog !== null && (
        <div className="dialog-overlay" onClick={() => setShowDeleteDialog(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">🗑️ Hapus Notebook?</div>
            <p style={{ color: '#b2bec3', marginBottom: '24px', lineHeight: 1.6 }}>
              Semua halaman dalam notebook ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button className="btn-secondary" onClick={() => setShowDeleteDialog(null)}>
                Batal
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
