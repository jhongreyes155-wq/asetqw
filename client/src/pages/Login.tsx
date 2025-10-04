import { useState } from "react";

export default function Login() {
  const [loggingIn, setLoggingIn] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Lab Manager</h1>
        <p className="text-muted-foreground mb-8">
          Please log in with your Replit account to continue.
        </p>
        <button
          onClick={() => {
            setLoggingIn(true);
            window.location.href = '/api/login';
          }}
          disabled={loggingIn}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loggingIn ? 'Logging in...' : 'Login with Replit'}
        </button>
      </div>
    </div>
  );
}
