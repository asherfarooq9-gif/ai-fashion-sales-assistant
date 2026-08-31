import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, admin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@brand.test');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (admin) {
    navigate('/', { replace: true });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate('/', { replace: true });
    } catch {
      /* handled by interceptor */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-7">
        <p className="font-display text-2xl text-blush-700">FashionHub</p>
        <p className="mb-6 text-sm text-black/50">Admin sign in</p>
        <label className="label">Email</label>
        <input className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        <label className="label">Password</label>
        <input
          className="input mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoFocus
        />
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
