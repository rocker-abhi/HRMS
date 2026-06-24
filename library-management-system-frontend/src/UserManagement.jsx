import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users, Edit2, Trash2, Plus, X, Shield, Mail, User,
  AlertCircle, Search, Filter, Check, KeyRound, Loader2,
  ChevronDown, CheckCircle2, AlertTriangle,
} from 'lucide-react';

/* ─── Shared Styles ──────────────────────────────────────────────────────── */
const inputStyle = {
  width: '100%', paddingLeft: '2.375rem', paddingRight: '1rem',
  paddingTop: '0.625rem', paddingBottom: '0.625rem',
  border: '1.5px solid #E4E9F7', borderRadius: '10px',
  background: '#F8FAFF', color: '#1E1B4B', fontSize: '0.875rem',
  outline: 'none', transition: 'all 0.18s', fontFamily: 'var(--font-sans)',
};
const focusInput  = e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; };
const blurInput   = e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; e.target.style.boxShadow = 'none'; };

/* ─── Toast Notification ─────────────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.875rem 1.25rem', borderRadius: '12px', minWidth: '280px',
          background: t.type === 'success' ? '#ECFDF5' : '#FFF5F5',
          border: `1.5px solid ${t.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {t.type === 'success'
            ? <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
            : <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          }
          <span style={{ fontSize: '0.85rem', color: t.type === 'success' ? '#065F46' : '#991B1B', fontWeight: 500, lineHeight: 1.4 }}>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ─── Badge helpers ──────────────────────────────────────────────────────── */
function AccountBadge({ type }) {
  const map = {
    ADMIN:      { bg: 'rgba(79,70,229,0.08)',  color: '#4F46E5', dot: '#4F46E5' },
    SUPERVISOR: { bg: 'rgba(8,145,178,0.08)',  color: '#0891B2', dot: '#0891B2' },
    CUSTOMER:   { bg: 'rgba(5,150,105,0.08)',  color: '#059669', dot: '#059669' },
  };
  const s = map[type] || map.CUSTOMER;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.625rem', borderRadius: '100px', background: s.bg, fontSize: '0.75rem', fontWeight: 600, color: s.color }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {type}
    </span>
  );
}

function StatusBadge({ isActive, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.25rem 0.625rem', borderRadius: '100px', border: 'none', cursor: loading ? 'wait' : 'pointer',
        background: isActive ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
        color: isActive ? '#059669' : '#DC2626', fontSize: '0.75rem', fontWeight: 600,
        transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
        opacity: loading ? 0.7 : 1,
      }}>
      {loading
        ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
        : <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#059669' : '#DC2626', display: 'inline-block' }} />
      }
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function UserManagement() {
  const [users,        setUsers]        = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fetchError,   setFetchError]   = useState('');
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editingUser,  setEditingUser]  = useState(null);
  const [formData,     setFormData]     = useState({ username: '', email: '', account_type: 'CUSTOMER', is_active: true });
  const [createdOtp,   setCreatedOtp]   = useState('');
  const [copied,       setCopied]       = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [formError,    setFormError]    = useState('');
  const [toasts,       setToasts]       = useState([]);
  const [toggleLoading, setToggleLoading] = useState({});
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterType,   setFilterType]   = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  /* ── Toast helper ── */
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  /* ── Fetch users ── */
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setFetchError('');
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('http://localhost:8000/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to load users.');
        if (result.success) setUsers(result.data);
      } catch (err) {
        setFetchError(err.message || 'Failed to load users. Please refresh.');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  /* ── Filtered list ── */
  const filteredUsers = useMemo(() => users.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchSearch = u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchType   = filterType === 'ALL' || u.account_type === filterType;
    const matchStatus = filterStatus === 'ALL'
      || (filterStatus === 'ACTIVE' && u.is_active)
      || (filterStatus === 'INACTIVE' && !u.is_active);
    return matchSearch && matchType && matchStatus;
  }), [users, searchTerm, filterType, filterStatus]);

  /* ── Modal ── */
  const handleOpenModal = (user = null) => {
    setFormError('');
    setCreatedOtp('');
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, email: user.email, account_type: user.account_type, is_active: user.is_active });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', account_type: 'CUSTOMER', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormError('');
    setCreatedOtp('');
  };

  /* ── Submit (create or update) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const token = localStorage.getItem('access_token');
      if (editingUser) {
        /* Update */
        const res = await fetch(`http://localhost:8000/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            username: formData.username.trim(),
            email: formData.email.trim(),
            is_active: formData.is_active,
          }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || 'Failed to update user.');
        setUsers(prev => prev.map(u => u.id === editingUser.id ? result.data : u));
        addToast(`${result.data.username} updated successfully.`);
        handleCloseModal();
      } else {
        /* Create */
        const res = await fetch('http://localhost:8000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            username: formData.username.trim(),
            email: formData.email.trim(),
            account_type: formData.account_type,
          }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || 'Failed to create user.');
        setUsers(prev => [...prev, result.data.user_data]);
        setCreatedOtp(result.data.user_otp);
      }
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"? This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to delete user.');
      setUsers(prev => prev.filter(u => u.id !== user.id));
      addToast(`${user.username} has been deleted.`);
    } catch (err) {
      addToast(err.message || 'Failed to delete user.', 'error');
    }
  };

  /* ── Toggle Active ── */
  const toggleActive = async (user) => {
    setToggleLoading(prev => ({ ...prev, [user.id]: true }));
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to update status.');
      setUsers(prev => prev.map(u => u.id === user.id ? result.data : u));
      addToast(`${result.data.username} set to ${result.data.is_active ? 'Active' : 'Inactive'}.`);
    } catch (err) {
      addToast(err.message || 'Failed to update user status.', 'error');
    } finally {
      setToggleLoading(prev => ({ ...prev, [user.id]: false }));
    }
  };

  /* ── Reset Password ── */
  const handleResetPassword = async (user) => {
    if (!window.confirm(`Reset password for "${user.username}"? A new OTP will be generated.`)) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to reset password.');
      setEditingUser(user);
      setCreatedOtp(result.data.user_otp);
      setIsModalOpen(true);
    } catch (err) {
      addToast(err.message || 'Failed to reset password.', 'error');
    }
  };

  /* ── Copy OTP ── */
  const handleCopyOtp = () => {
    if (createdOtp) {
      navigator.clipboard.writeText(createdOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ─── Render ──────────────────────────────────────────────────────────── */
  const th = { padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-sans)' }}>
      <Toast toasts={toasts} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B' }}>Employee Directory</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#9CA3AF' }}>Manage user accounts, roles, and access.</p>
        </div>
        <button onClick={() => handleOpenModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem',
            borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            boxShadow: '0 4px 12px rgba(79,70,229,0.35)', transition: 'all 0.18s',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(79,70,229,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.35)'; }}>
          <Plus size={16} strokeWidth={2.5} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input type="text" placeholder="Search by name or email…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', width: '100%' }}
            onFocus={focusInput} onBlur={blurInput} />
        </div>
        {/* Type filter */}
        <div style={{ position: 'relative', minWidth: '148px' }}>
          <Shield size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
            onFocus={focusInput} onBlur={blurInput}>
            <option value="ALL">All Types</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="CUSTOMER">Customer</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        </div>
        {/* Status filter */}
        <div style={{ position: 'relative', minWidth: '148px' }}>
          <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
            onFocus={focusInput} onBlur={blurInput}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Fetch error */}
      {fetchError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1rem', borderRadius: '12px', background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.15)' }}>
          <AlertCircle size={16} color="#DC2626" />
          <span style={{ color: '#991B1B', fontSize: '0.85rem' }}>{fetchError}</span>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E4E9F7', boxShadow: '0 2px 8px rgba(79,70,229,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFF', borderBottom: '1.5px solid #E4E9F7' }}>
                <th style={th}>User</th>
                <th style={th}>Account Type</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center' }}>
                  <Loader2 size={28} color="#4F46E5" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  <p style={{ color: '#9CA3AF', marginTop: '0.75rem', fontSize: '0.85rem' }}>Loading users…</p>
                </td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '3.5rem', textAlign: 'center' }}>
                  <Users size={36} color="#E4E9F7" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No users found matching your filters.</p>
                </td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #F0F4FF', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {/* User */}
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                        background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.08))',
                        border: '1.5px solid rgba(79,70,229,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#4F46E5', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase',
                      }}>
                        {user.username.substring(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1E1B4B', fontSize: '0.875rem' }}>{user.username}</div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <Mail size={11} />{user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Type */}
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <AccountBadge type={user.account_type} />
                  </td>
                  {/* Status */}
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <StatusBadge
                      isActive={user.is_active}
                      loading={!!toggleLoading[user.id]}
                      onClick={() => toggleActive(user)}
                    />
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                      <ActionBtn title="Reset Password" color="#D97706" hoverBg="rgba(217,119,6,0.08)" onClick={() => handleResetPassword(user)}>
                        <KeyRound size={15} />
                      </ActionBtn>
                      <ActionBtn title="Edit User" color="#4F46E5" hoverBg="rgba(79,70,229,0.08)" onClick={() => handleOpenModal(user)}>
                        <Edit2 size={15} />
                      </ActionBtn>
                      <ActionBtn
                        title={user.account_type === 'ADMIN' ? 'Admin cannot be deleted' : 'Delete User'}
                        color="#DC2626" hoverBg="rgba(220,38,38,0.08)"
                        onClick={() => handleDelete(user)}
                        disabled={user.account_type === 'ADMIN'}>
                        <Trash2 size={15} />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Footer count */}
        {!loadingUsers && filteredUsers.length > 0 && (
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #F0F4FF', background: '#FAFBFF' }}>
            <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
              Showing <strong style={{ color: '#4B5563' }}>{filteredUsers.length}</strong> of <strong style={{ color: '#4B5563' }}>{users.length}</strong> users
            </span>
          </div>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', background: 'rgba(30,27,75,0.25)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '440px',
            boxShadow: '0 24px 60px rgba(79,70,229,0.18), 0 8px 20px rgba(0,0,0,0.08)',
            border: '1.5px solid #E4E9F7', overflow: 'hidden',
            animation: 'fadeUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1.5px solid #F0F4FF' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E1B4B' }}>
                {createdOtp ? (editingUser ? 'Password Reset' : 'User Created') : (editingUser ? 'Edit User' : 'Add New User')}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: '0.25rem', borderRadius: '8px', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0F4FF'; e.currentTarget.style.color = '#1E1B4B'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9CA3AF'; }}>
                <X size={18} />
              </button>
            </div>

            {/* OTP Success Screen */}
            {createdOtp ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'rgba(5,150,105,0.08)', border: '2px solid rgba(5,150,105,0.2)', marginBottom: '1.25rem',
                }}>
                  <Check size={28} color="#059669" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#1E1B4B', fontSize: '1.05rem', fontWeight: 700 }}>
                  {editingUser ? 'Password Reset Successful' : 'User Created Successfully'}
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Share this OTP with <strong style={{ color: '#1E1B4B' }}>{editingUser?.username || formData.username}</strong>. It will not be shown again.
                </p>
                {/* OTP Display */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: '12px', background: '#F8FAFF', border: '1.5px solid #E4E9F7', marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '1.5rem', fontWeight: 800, color: '#4F46E5', letterSpacing: '0.15em' }}>{createdOtp}</span>
                  <button onClick={handleCopyOtp}
                    style={{
                      padding: '0.5rem 0.875rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: copied ? 'rgba(5,150,105,0.1)' : 'rgba(79,70,229,0.08)',
                      color: copied ? '#059669' : '#4F46E5', fontSize: '0.78rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
                    }}>
                    {copied ? <><Check size={13} /> Copied!</> : 'Copy OTP'}
                  </button>
                </div>
                <button onClick={() => { setCreatedOtp(''); handleCloseModal(); }}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#fff',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
                  }}>
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {formError && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.15)' }}>
                    <AlertCircle size={15} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ color: '#991B1B', fontSize: '0.82rem', lineHeight: 1.5 }}>{formError}</span>
                  </div>
                )}

                {/* Username */}
                <ModalField label="Username" icon={<User size={14} />}>
                  <input type="text" required value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. john.doe" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </ModalField>

                {/* Email */}
                <ModalField label="Email Address" icon={<Mail size={14} />}>
                  <input type="email" required value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </ModalField>

                {/* Account Type (create only) */}
                {!editingUser && (
                  <ModalField label="Account Type" icon={<Shield size={14} />}>
                    <select value={formData.account_type} onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                      style={{ ...inputStyle, paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
                      onFocus={focusInput} onBlur={blurInput}>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="CUSTOMER">Customer (Student)</option>
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  </ModalField>
                )}

                {/* Status (edit only) */}
                {editingUser && (
                  <ModalField label="Account Status" icon={<Filter size={14} />}>
                    <select value={formData.is_active ? 'ACTIVE' : 'INACTIVE'}
                      onChange={e => setFormData({ ...formData, is_active: e.target.value === 'ACTIVE' })}
                      style={{ ...inputStyle, paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
                      onFocus={focusInput} onBlur={blurInput}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                    <ChevronDown size={13} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  </ModalField>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1.5px solid #F0F4FF' }}>
                  <button type="button" onClick={handleCloseModal}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: '10px',
                      border: '1.5px solid #E4E9F7', background: '#F8FAFF',
                      color: '#4B5563', fontWeight: 600, fontSize: '0.875rem',
                      cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F0F4FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFF'; }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none',
                      background: submitting ? '#A5B4FC' : 'linear-gradient(135deg, #4F46E5, #6366F1)',
                      color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      boxShadow: submitting ? 'none' : '0 4px 12px rgba(79,70,229,0.35)',
                      fontFamily: 'var(--font-sans)', transition: 'all 0.18s',
                    }}>
                    {submitting
                      ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />{editingUser ? 'Saving…' : 'Creating…'}</>
                      : editingUser ? 'Save Changes' : 'Create User'
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}

/* ─── Small UI helpers ───────────────────────────────────────────────────── */
function ActionBtn({ children, title, color, hoverBg, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button title={title} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: (!disabled && hov) ? hoverBg : 'transparent',
        color: disabled ? '#D1D9F0' : hov ? color : '#9CA3AF',
        display: 'flex', transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
      }}>
      {children}
    </button>
  );
}

function ModalField({ label, icon, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}
