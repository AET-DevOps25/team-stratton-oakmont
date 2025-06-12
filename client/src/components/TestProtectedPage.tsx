import { useAuth } from '../context/AuthContext';
import './Form.css';

function TestProtectedPage() {
  const { userEmail, userId, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="form-container">
      <h2>🔒 Protected Test Page</h2>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>
          <strong>Congratulations!</strong> You have successfully accessed a protected route.
        </p>
        <p>This page should only be visible when you are logged in.</p>
        
        <div style={{ 
          background: '#f0f8ff', 
          padding: '15px', 
          margin: '20px 0', 
          borderRadius: '5px',
          border: '1px solid #ccc'
        }}>
          <h3>Your Authentication Details:</h3>
          <p><strong>User ID:</strong> {userId || 'Not available'}</p>
          <p><strong>Email:</strong> {userEmail || 'Not available'}</p>
          <p><strong>Login Status:</strong> ✅ Authenticated</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleLogout}
            className="form-button"
            style={{ backgroundColor: '#dc3545', marginRight: '10px' }}
          >
            Logout
          </button>
          <button 
            onClick={() => window.history.back()}
            className="form-button"
            style={{ backgroundColor: '#6c757d' }}
          >
            Go Back
          </button>
        </div>

        <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
          <h4>Test Instructions:</h4>
          <ol style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Try accessing this page while logged out - you should be redirected</li>
            <li>Login first, then navigate to this page - you should see this content</li>
            <li>Click logout and try to access again - you should be blocked</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default TestProtectedPage;