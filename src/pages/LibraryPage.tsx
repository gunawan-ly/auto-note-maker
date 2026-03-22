import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  BookOpen,
  Upload,
  X,
  MoreVertical,
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
  const [actionSheetNotebook, setActionSheetNotebook] = useState<number | null>(null);

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

  const openActionSheet = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActionSheetNotebook(id);
  };

  const handleActionEdit = () => {
    if (actionSheetNotebook === null) return;
    const nb = notebooks.find((n) => n.id === actionSheetNotebook);
    if (nb) {
      setEditTitle(nb.title);
      setShowEditDialog(actionSheetNotebook);
    }
    setActionSheetNotebook(null);
  };

  const handleActionDelete = () => {
    if (actionSheetNotebook === null) return;
    setShowDeleteDialog(actionSheetNotebook);
    setActionSheetNotebook(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) + ' ' + new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actionSheetNb = actionSheetNotebook !== null
    ? notebooks.find((nb) => nb.id === actionSheetNotebook)
    : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="app-header">
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="#AF52DE" />
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Auto Note Maker
            </h1>
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
      </header>

      {/* Search */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 20px 0', width: '100%' }}>
        <div className="search-wrapper" style={{ width: '100%' }}>
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Cari notebook..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Notebooks Grid */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', flex: 1, width: '100%' }}>
        {filteredNotebooks.length === 0 && !search ? (
          <div>
            {/* Show just the create card when empty */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div className="notebook-card-ios">
                <button className="create-card-ios" onClick={() => setShowCreateDialog(true)}>
                  <div className="create-icon-ios">
                    <Plus size={24} />
                  </div>
                  <span className="create-label-ios">Buat</span>
                </button>
              </div>
            </div>
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">Belum ada notebook</div>
              <div className="empty-state-desc">
                Tap "Buat" untuk membuat notebook pertamamu!
              </div>
            </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Create card - first item */}
            <div className="notebook-card-ios">
              <button className="create-card-ios" onClick={() => setShowCreateDialog(true)}>
                <div className="create-icon-ios">
                  <Plus size={24} />
                </div>
                <span className="create-label-ios">Buat</span>
              </button>
            </div>

            {/* Notebook cards */}
            {filteredNotebooks.map((nb) => (
              <div key={nb.id} className="notebook-card-ios">
                <div
                  className="notebook-cover-ios"
                  style={{
                    background: nb.coverImage
                      ? `url(${nb.coverImage}) center/cover no-repeat`
                      : nb.coverColor,
                  }}
                  onClick={() => navigate(`/notebook/${nb.id}`)}
                >
                  <span className="cover-emoji-ios">{nb.coverEmoji}</span>
                  <span className="cover-title-ios">{nb.title}</span>
                </div>
                <div className="notebook-info-ios">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="nb-title">{nb.title}</div>
                    <div className="nb-date">{formatDate(nb.updatedAt)}</div>
                  </div>
                  <button
                    className="menu-dots-btn"
                    onClick={(e) => openActionSheet(e, nb.id!)}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="squircle-card"
              onClick={() => setShowCreateDialog(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                border: 'none',
                fontFamily: 'inherit',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div className="create-icon-ios" style={{ width: 44, height: 44, flexShrink: 0 }}>
                <Plus size={20} />
              </div>
              <span style={{ color: 'var(--ios-blue)', fontWeight: 500, fontSize: '0.95rem' }}>
                Buat Notebook Baru
              </span>
            </button>

            {filteredNotebooks.map((nb) => (
              <div
                key={nb.id}
                className="squircle-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: nb.coverImage
                      ? `url(${nb.coverImage}) center/cover no-repeat`
                      : nb.coverColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                  }}
                  onClick={() => navigate(`/notebook/${nb.id}`)}
                >
                  {nb.coverEmoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => navigate(`/notebook/${nb.id}`)}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nb.title}
                  </div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem', marginTop: '2px' }}>
                    {formatDate(nb.updatedAt)}
                  </div>
                </div>
                <button
                  className="menu-dots-btn"
                  onClick={(e) => openActionSheet(e, nb.id!)}
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', margin: 0 }}>
            © {new Date().getFullYear()} <span style={{ fontWeight: 600 }}>Auto Note Maker</span>
          </p>
          <p style={{ color: 'var(--text-quaternary)', fontSize: '0.7rem', marginTop: '2px' }}>
            Developed by <span style={{ color: 'var(--ios-pink)', fontWeight: 600 }}>Awanophile</span>
          </p>
        </div>
      </footer>

      {/* ===== iOS Action Sheet ===== */}
      {actionSheetNotebook !== null && (
        <div className="action-sheet-overlay" onClick={() => setActionSheetNotebook(null)}>
          <div className="action-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="action-sheet-group">
              {actionSheetNb && (
                <div className="action-sheet-header">
                  <div className="as-title">{actionSheetNb.title}</div>
                </div>
              )}
              <button className="action-sheet-btn" onClick={handleActionEdit}>
                Edit
              </button>
              <button className="action-sheet-btn destructive" onClick={handleActionDelete}>
                Hapus
              </button>
            </div>
            <button
              className="action-sheet-btn cancel"
              onClick={() => setActionSheetNotebook(null)}
            >
              Batalkan
            </button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="dialog-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="dialog-content dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">📓 Buat Notebook Baru</div>

            <label style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
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
            <label style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 500, marginTop: '18px', marginBottom: '6px', display: 'block' }}>
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

            <label style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 500, marginTop: '18px', marginBottom: '6px', display: 'block' }}>
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

            <label style={{ color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 500, marginTop: '6px', marginBottom: '6px', display: 'block' }}>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
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
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px', lineHeight: 1.6, textAlign: 'center', fontSize: '0.9rem' }}>
              Semua halaman dalam notebook ini akan dihapus secara permanen.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setShowDeleteDialog(null)}>
                Batal
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
