import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username: email, password });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user ?? { email }));
      nav("/");
    } catch (e: any) {
      setErr(e.response?.data?.message ?? "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-6 space-y-4">
        <div>
          <div className="font-bold text-brand text-lg">CV. Restu Bumi Bersama</div>
          <div className="text-sm text-slate-500">Login Admin Panel</div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {err && <div className="text-sm text-brand">{err}</div>}
        <button className="btn-primary w-full justify-center" disabled={loading}>
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
