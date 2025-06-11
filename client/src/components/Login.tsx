import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      // In a real app, you'd use the /api proxy configured in vite.config.ts
      // For now, assuming user-auth-service is running on 8083 locally
      const response = await fetch('http://localhost:8083/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Login successful! Token: ${data.token}`);
        // Store the token in localStorage
        localStorage.setItem('jwtToken', data.token);
        // You might want to store other user info as well, e.g., userId or email
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        if (data.email) {
          localStorage.setItem('userEmail', data.email);
        }
        // TODO: Redirect to a protected route or update UI
      } else {
        setMessage(`Login failed: ${data.message || response.statusText}`);
        localStorage.removeItem('jwtToken'); // Clear any old token
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
      }
    } catch (error) {
      setMessage(`Login request failed: ${error}`);
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            //type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            //required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;