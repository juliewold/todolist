import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { useAuth } from "./authContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(await signIn(email.trim(), password));
    setBusy(false);
  };

  return (
    <main className="login">
      <section className="card login__card">
        <h1 className="logo">todo.</h1>
        <p className="muted">Logg inn for å se planen og vanene dine.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">E-post</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </label>
          <label className="field">
            <span className="field__label">Passord</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
          </label>
          {error ? <p className="field__error" role="alert">{error}</p> : null}
          <Button variant="primary" type="submit" disabled={busy}>
            {busy ? "Logger inn …" : "Logg inn"}
          </Button>
        </form>
      </section>
    </main>
  );
}
