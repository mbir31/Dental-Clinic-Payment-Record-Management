import React, { useState } from 'react';

interface PasswordPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
  adminPin?: string;
}

export default function PasswordPrompt({ onSuccess, onCancel, adminPin }: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === (adminPin || '1234')) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-[100] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-200">
        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
          <span>🔒</span> Enter Admin Password
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Accessing settings requires validation. {(!adminPin || adminPin === '1234') ? (
            <>Default password is <strong className="text-slate-800 font-bold">1234</strong>.</>
          ) : (
            <>Enter your customized 4-digit PIN.</>
          )}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              id="password-input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-center text-lg font-extrabold tracking-widest text-slate-800"
              autoFocus
              required
            />
            {error && (
              <span className="text-xs font-semibold text-rose-600 block mt-2 text-center bg-rose-50 border border-rose-100 py-1 rounded">
                ⚠️ Incorrect password! Try again.
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-sky-600 text-white rounded text-xs font-bold hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
