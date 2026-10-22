import { useState } from 'react';
import { useMenu } from '../context/MenuContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';
import { logAction } from '../utils/logger.js';

const CATEGORIES = ['Fast Food', 'South Indian', 'Main Course', 'Dessert', 'Drinks'];
const EMOJIS = ['🍔', '🍕', '🥞', '🥘', '🍛', '🍰', '🍹', '🌯', '🍜', '🥗', '🍱', '🍣', '🥪', '🧆', '🍟'];

const EMPTY_FORM = { name: '', category: 'Fast Food', price: '', rating: '', emoji: '🍔', description: '' };

export default function AdminMenu() {
  const { user } = useAuth();
  const { items, loading, error, addItem, updateItem, deleteItem } = useMenu();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [search, setSearch] = useState('');

  // Only logged-in users can manage menu (admin feature)
  if (!user) return <Navigate to="/login" replace />;

  function openAdd() {
    logAction('crud', 'ADMIN OPEN ADD ITEM MODAL', {});
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(''); setFormSuccess('');
    setShowForm(true);
  }

  function openEdit(item) {
    logAction('crud', 'ADMIN OPEN EDIT ITEM MODAL', { itemId: item.id, itemName: item.name });
    setEditingId(item.id);
    setForm({ name: item.name, category: item.category, price: String(item.price), rating: String(item.rating), emoji: item.emoji, description: item.description });
    setFormError(''); setFormSuccess('');
    setShowForm(true);
  }

  function cancelForm() {
    logAction('crud', 'ADMIN CANCEL FORM MODAL', {});
    setShowForm(false);
    setEditingId(null);
    setFormError('');
    setFormSuccess('');
  }

  function handleChange(e) {
    setForm(old => ({ ...old, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim()) return 'Food name is required.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) return 'Enter a valid price (> 0).';
    if (form.rating && (isNaN(form.rating) || Number(form.rating) < 1 || Number(form.rating) > 5)) return 'Rating must be between 1 and 5.';
    if (!form.description.trim()) return 'Description is required.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      logAction('crud', 'ADMIN FORM VALIDATION FAILED', { error: msg });
      setFormError(msg);
      return;
    }
    setFormError(''); setFormSuccess('');
    const payload = { ...form, price: Number(form.price), rating: Number(form.rating) || 4.0 };
    if (editingId) {
      const res = await updateItem({ ...payload, id: editingId });
      if (res.ok) { setFormSuccess('✅ Food item updated successfully!'); setTimeout(cancelForm, 1200); }
    } else {
      const res = await addItem(payload);
      if (res.ok) { setFormSuccess('✅ Food item added successfully!'); setTimeout(cancelForm, 1200); }
    }
  }

  async function handleDelete(id) {
    logAction('crud', 'ADMIN CONFIRM DELETE', { targetId: id });
    const res = await deleteItem(id);
    if (res.ok) { setDeleteConfirmId(null); }
  }

  const filtered = items.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="content">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ADMIN PANEL (REST CRUD)</p>
          <h2>Manage Food Menu</h2>
        </div>
        <button onClick={openAdd} disabled={loading}>+ Add New Item</button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="message loading-message">⏳ Processing REST API call…</p>}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit food item' : 'Add food item'}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Food Item' : '➕ Add New Food Item'}</h3>
              <button type="button" className="close-btn" onClick={cancelForm} aria-label="Close">✕</button>
            </div>

            {formError && <p className="error-message" role="alert">{formError}</p>}
            {formSuccess && <p className="success-message" role="status">{formSuccess}</p>}

            <form className="form-stack" onSubmit={handleSubmit} noValidate>
              <label>
                Food Name *
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Paneer Tikka" required />
              </label>

              <div className="form-row">
                <label>
                  Category *
                  <select name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label>
                  Emoji *
                  <select name="emoji" value={form.emoji} onChange={handleChange}>
                    {EMOJIS.map(em => <option key={em} value={em}>{em}</option>)}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Price (₹) *
                  <input name="price" value={form.price} onChange={handleChange} type="number" min="1" placeholder="e.g. 150" required />
                </label>
                <label>
                  Rating (1–5)
                  <input name="rating" value={form.rating} onChange={handleChange} type="number" min="1" max="5" step="0.1" placeholder="e.g. 4.5" />
                </label>
              </div>

              <label>
                Description *
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the food item…" required />
              </label>

              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving…' : (editingId ? 'Update Item (PUT)' : 'Add Item (POST)')}
                </button>
                <button type="button" className="btn-secondary" onClick={cancelForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-box confirm-box">
            <div style={{ fontSize: '40px', textAlign: 'center' }}>🗑️</div>
            <h3 style={{ textAlign: 'center' }}>Delete this item?</h3>
            <p style={{ textAlign: 'center', color: '#777' }}>This action will execute a DELETE /api/foods/:id request.</p>
            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button onClick={() => handleDelete(deleteConfirmId)} disabled={loading}>
                {loading ? 'Deleting…' : 'Yes, Delete (DELETE)'}
              </button>
              <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div style={{ marginBottom: '18px' }}>
        <input
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            if (e.target.value.trim()) logAction('crud', 'ADMIN SEARCH ITEMS', { query: e.target.value });
          }}
          placeholder="Search food items…"
          aria-label="Search food items"
          style={{ maxWidth: '380px' }}
        />
      </div>

      {/* Admin Table */}
      <div className="admin-table-wrap panel">
        <table className="admin-table" aria-label="Food items management table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#777' }}>No items found.</td></tr>
            )}
            {filtered.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="table-food-name">
                    <span className="table-emoji">{item.emoji}</span>
                    <b>{item.name}</b>
                  </div>
                </td>
                <td><span className="category-tag">{item.category}</span></td>
                <td><strong>₹{item.price}</strong></td>
                <td>⭐ {item.rating}</td>
                <td className="desc-cell">{item.description}</td>
                <td>
                  <div className="action-btns">
                    <button
                      className="btn-edit"
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      disabled={loading}
                    >✏️ Edit</button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        logAction('crud', 'ADMIN CLICK DELETE', { itemId: item.id, itemName: item.name });
                        setDeleteConfirmId(item.id);
                      }}
                      aria-label={`Delete ${item.name}`}
                      disabled={loading}
                    >🗑️ Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="table-footer">{filtered.length} of {items.length} items shown</p>
      </div>
    </main>
  );
}
