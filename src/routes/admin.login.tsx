import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        setMessage(result.message || 'Login gagal');
        setLoading(false);
        return;
      }

      setMessage(`Login berhasil untuk ${result.admin?.name || username}`);
    } catch (error) {
      console.error(error);
      setMessage('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fb', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'white', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Admin Login</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Masuk dengan email/nama admin dan password dari database.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Username / Email</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@gmail.com"
              style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="12345678"
              style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px' }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', fontWeight: 600 }}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        {message ? (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: message.includes('berhasil') ? '#dcfce7' : '#fee2e2', color: message.includes('berhasil') ? '#166534' : '#991b1b' }}>
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
