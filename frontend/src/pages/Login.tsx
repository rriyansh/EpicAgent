import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

type Mode = "signin" | "create" | "forgot";

export default function Login({ onSuccess }: { onSuccess: (email: string) => void }) {
  const { login, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNote("");

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Enter the email on your EpicAgent account.");
        return;
      }
      setNote("If that account exists, a reset link is on its way.");
      return;
    }

    if (mode === "create") {
      if (password.length < 8) {
        setError("Use at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      onSuccess(email.trim());
      return;
    }

    try {
      await login(email.trim(), password);
      onSuccess(email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  const title = mode === "create" ? "Create account" : mode === "forgot" ? "Reset password" : "EpicAgent";
  const subtitle =
    mode === "create"
      ? "Start a calm workspace. The agent takes it from here."
      : mode === "forgot"
        ? "We will send a reset link to this address."
        : "Sign in to your EpicAgent account and continue your mission.";

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{title}</h1>
        <p className="auth-lead">{subtitle}</p>

        <label className="field">
          <span className="sr-only">Email address</span>
          <span className="field-icon" aria-hidden="true">
            <MailIcon />
          </span>
          <input
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {mode !== "forgot" && (
          <label className="field">
            <span className="sr-only">Password</span>
            <span className="field-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="ghost-icon"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              <EyeIcon />
            </button>
          </label>
        )}

        {mode === "create" && (
          <label className="field">
            <span className="sr-only">Confirm password</span>
            <span className="field-icon" aria-hidden="true">
              <LockIcon />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>
        )}

        {mode === "signin" && (
          <button type="button" className="text-link align-end" onClick={() => setMode("forgot")}>
            Forgot Password?
          </button>
        )}

        {error && <p className="form-error">{error}</p>}
        {note && <p className="form-note">{note}</p>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : mode === "create" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign In"}
        </button>

        {mode === "signin" && (
          <>
            <div className="or-row">
              <span />
              or continue with
              <span />
            </div>
            <button
              type="button"
              className="btn-google"
              onClick={() => setNote("Google sign-in is not connected yet. Use email to continue.")}
            >
              <GoogleMark />
              Google
            </button>
            <p className="auth-foot">
              Not an agent yet?{" "}
              <button type="button" className="text-link" onClick={() => setMode("create")}>
                Create Account
              </button>
            </p>
          </>
        )}

        {mode !== "signin" && (
          <button type="button" className="text-link auth-foot" onClick={() => setMode("signin")}>
            Back to sign in
          </button>
        )}
      </form>
    </div>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12S6.5 6.5 12 6.5 21.5 12 21.5 12 17.5 17.5 12 17.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8A6.4 6.4 0 1 1 12 5.6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 3.2 14.6 2.2 12 2.2 6.8 2.2 2.6 6.4 2.6 11.6S6.8 21 12 21c5.5 0 9.1-3.8 9.1-9.2 0-.6 0-1.1-.1-1.6H12z" />
      <path fill="#34A853" d="M3.8 7.3l3.2 2.4A6.4 6.4 0 0 1 12 5.6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 3.2 14.6 2.2 12 2.2 8.2 2.2 5 4.3 3.8 7.3z" />
      <path fill="#FBBC05" d="M12 21c2.5 0 4.7-.8 6.2-2.3l-2.9-2.4c-.8.6-1.8 1.1-3.3 1.1-3.9 0-5.3-2.5-5.5-3.8l-3.2 2.5C4.9 18.9 8.1 21 12 21z" />
      <path fill="#4285F4" d="M21.1 11.8H12v3.9h5.5c-.3 1.4-1.1 2.4-2.2 3.1l2.9 2.4c1.7-1.6 2.9-4 2.9-6.9 0-.6 0-1.1-.1-1.6.1-.3.1-.6 0-.9z" />
    </svg>
  );
}
