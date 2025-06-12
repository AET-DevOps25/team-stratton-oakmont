import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Form.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:8083/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Login successful! User: ${email} You will be redirected to home.`);
        setIsError(false);

        login(data.token, data.userId, data.email);
        navigate('/');
      } else {
        if (data.error && data.message) {
            setMessage(data.message);
        } else {
            setMessage(`Login failed: ${data.message || response.statusText}`);
        }
        setIsError(true);
      }
    } catch (error) {
      setMessage(`Login request failed: ${error instanceof Error ? error.message : String(error)}`);
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button">Login</button>
      </form>
      {message && (
        <p className={`form-message ${isError ? 'error' : 'success'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Login;