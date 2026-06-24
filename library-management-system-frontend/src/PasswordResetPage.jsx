import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Loader2, Check } from 'lucide-react';

const inputStyle = {
  width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
  paddingTop: '0.75rem', paddingBottom: '0.75rem',
  border: '1.5px solid #E4E9F7', borderRadius: '12px',
  background: '#F8FAFF', color: '#1E1B4B',
  fontSize: '0.9rem', outline: 'none', transition: 'all 0.18s',
  fontFamily: 'var(--font-sans)',
};

function InputField({ label, id, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

const iconStyle = {
  position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
  color: '#9CA3AF', display: 'flex',
};

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialUsername = location.state?.username || '';
  const initialTempPassword = location.state?.tempPassword || '';

  const [username, setUsername] = useState(initialUsername);
  const [oldPassword, setOldPassword] = useState(initialTempPassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validations = {
    length:    newPassword.length >= 8 && newPassword.length <= 128,
    lowercase: /[a-z]/.test(newPassword),
    number:    /\d/.test(newPassword),
    special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(newPassword),
    match:     newPassword === confirmPassword && newPassword !== '',
  };
  const isValid = Object.values(validations).every(Boolean);

  const handleFocus = e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; };
  const handleBlur  = e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; e.target.style.boxShadow = 'none'; };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!isValid) { setError('Please ensure all password requirements are met.'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), old_password: oldPassword, new_password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reset password.');
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const wrapStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 40%, #E8EDFF 100%)',
    padding: '1.5rem', fontFamily: 'var(--font-sans)', position: 'relative', overflow: 'hidden',
  };

  const cardStyle = {
    width: '100%', maxWidth: '460px', background: '#FFFFFF', borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(79,70,229,0.14), 0 4px 16px rgba(0,0,0,0.06)',
    padding: '2.5rem', position: 'relative', zIndex: 1,
    border: '1px solid rgba(79,70,229,0.08)',
  };

  if (success) {
    return (
      <div style={wrapStyle}>
        <BlobDecor />
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(5,150,105,0.08)', border: '2px solid rgba(5,150,105,0.2)',
            marginBottom: '1.5rem',
            animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <CheckCircle2 size={36} color="#059669" />
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#1E1B4B', margin: '0 0 0.75rem' }}>Password Reset!</h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Your password has been updated. You can now sign in with your new credentials.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              color: '#fff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(79,70,229,0.4)', fontFamily: 'var(--font-sans)',
            }}
          >
            <span>Back to Sign In</span>
            <ArrowRight size={16} />
          </button>
        </div>
        <style>{`@keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <BlobDecor />
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            boxShadow: '0 8px 24px rgba(79,70,229,0.35)', marginBottom: '1.25rem',
          }}>
            <Lock size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1B4B', margin: 0, letterSpacing: '-0.02em' }}>Set New Password</h1>
          <p style={{ color: '#6B7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>Create a secure password to activate your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
            padding: '0.875rem 1rem', borderRadius: '12px',
            background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle size={17} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ color: '#991B1B', fontSize: '0.85rem', lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Username */}
          <InputField label="Username" id="reset-username">
            <span style={iconStyle}><User size={16} /></span>
            <input id="reset-username" type="text" required value={username}
              onChange={e => setUsername(e.target.value)} placeholder="Enter your username"
              style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </InputField>

          {/* Temp Password / OTP */}
          <InputField label="Temporary Password / OTP" id="reset-otp">
            <span style={iconStyle}><Lock size={16} /></span>
            <input id="reset-otp" type="text" required value={oldPassword}
              onChange={e => setOldPassword(e.target.value)} placeholder="Enter OTP or temporary password"
              style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
          </InputField>

          {/* New Password */}
          <InputField label="New Password" id="reset-new-password">
            <span style={iconStyle}><Lock size={16} /></span>
            <input id="reset-new-password" type={showNew ? 'text' : 'password'} required value={newPassword}
              onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password"
              style={{ ...inputStyle, paddingRight: '3rem' }} onFocus={handleFocus} onBlur={handleBlur} />
            <button type="button" onClick={() => setShowNew(!showNew)}
              style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </InputField>

          {/* Confirm Password */}
          <InputField label="Confirm New Password" id="reset-confirm-password">
            <span style={iconStyle}><Lock size={16} /></span>
            <input id="reset-confirm-password" type={showConfirm ? 'text' : 'password'} required value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password"
              style={{ ...inputStyle, paddingRight: '3rem' }} onFocus={handleFocus} onBlur={handleBlur} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </InputField>

          {/* Requirements */}
          <div style={{
            padding: '1rem', borderRadius: '12px',
            background: '#F8FAFF', border: '1.5px solid #E4E9F7',
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Requirements</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
              {[
                { key: 'length',    label: '8–128 characters' },
                { key: 'lowercase', label: 'One lowercase' },
                { key: 'number',    label: 'One number' },
                { key: 'special',   label: 'Special character' },
                { key: 'match',     label: 'Passwords match' },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: validations[key] ? '#059669' : '#E4E9F7',
                    transition: 'all 0.25s',
                  }}>
                    {validations[key] && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: validations[key] ? '#1E1B4B' : '#9CA3AF', transition: 'color 0.2s' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !isValid}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '12px', border: 'none',
              background: (!isValid || loading) ? '#C7D2FE' : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              color: '#fff', fontWeight: 600, fontSize: '0.95rem',
              cursor: (!isValid || loading) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: (!isValid || loading) ? 'none' : '0 4px 14px rgba(79,70,229,0.4)',
              fontFamily: 'var(--font-sans)', transition: 'all 0.18s',
            }}>
            {loading
              ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /><span>Resetting...</span></>
              : <span>Reset Password</span>
            }
          </button>

          <button type="button" onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            ← Back to Sign In
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function BlobDecor() {
  return (
    <>
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '45%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '45%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
    </>
  );
}
