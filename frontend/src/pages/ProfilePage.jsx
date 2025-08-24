import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth();
  const [form, setForm] = useState({ username: "", avatarUrl: "", statusMessage: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        avatarUrl: user.avatarUrl || "",
        statusMessage: user.statusMessage || "",
      });
    }
  }, [user]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <div className="p-4">Please log in.</div>;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      alert("Profile updated");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Your Profile</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm">Display name</span>
          <input
            name="username"
            className="border rounded w-full p-2"
            value={form.username}
            onChange={onChange}
          />
        </label>
        <label className="block">
          <span className="text-sm">Avatar URL</span>
          <input
            name="avatarUrl"
            className="border rounded w-full p-2"
            value={form.avatarUrl}
            onChange={onChange}
          />
        </label>
        <label className="block">
          <span className="text-sm">Status message</span>
          <input
            name="statusMessage"
            className="border rounded w-full p-2"
            value={form.statusMessage}
            onChange={onChange}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}