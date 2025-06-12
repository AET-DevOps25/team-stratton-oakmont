import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Form.css'; // Import the new CSS file

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:8083/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Registration successful for ${data.email || email}! You will be redirected to login.`);
        setIsError(false);
        navigate('/login');
      } else {
        setMessage(`Registration failed: ${data.message || response.statusText}`);
        setIsError(true);
      }
    } catch (error) {
      setMessage(`Registration request failed: ${error instanceof Error ? error.message : String(error)}`);
      setIsError(true);
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
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
        <button type="submit" className="form-button">Sign Up</button>
      </form>
      {message && (
        <p className={`form-message ${isError ? 'error' : 'success'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default SignUp;