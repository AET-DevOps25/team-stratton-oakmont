import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Form.css';

const UserProfile: React.FC = () => {
  const { userEmail, userId, isLoggedIn, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!isLoggedIn || !userEmail) {
    return (
      <div className="form-container">
        <h2>User Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>👤 User Profile</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Welcome to your profile page! Here you can view your account information.</p>
      </div>

      {/* User Information Table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        marginBottom: '20px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#e9ecef' }}>
            <th style={{ 
              padding: '12px', 
              textAlign: 'left', 
              borderBottom: '2px solid #dee2e6',
              fontWeight: 'bold'
            }}>
              Property
            </th>
            <th style={{ 
              padding: '12px', 
              textAlign: 'left', 
              borderBottom: '2px solid #dee2e6',
              fontWeight: 'bold'
            }}>
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ 
              padding: '12px', 
              borderBottom: '1px solid #dee2e6',
              fontWeight: '500'
            }}>
              User ID
            </td>
            <td style={{ 
              padding: '12px', 
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'monospace',
              backgroundColor: '#f1f3f4'
            }}>
              {userId || 'Not available'}
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px', 
              borderBottom: '1px solid #dee2e6',
              fontWeight: '500'
            }}>
              Email Address
            </td>
            <td style={{ 
              padding: '12px', 
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'monospace',
              backgroundColor: '#f1f3f4'
            }}>
              {userEmail || 'Not available'}
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px', 
              borderBottom: '1px solid #dee2e6',
              fontWeight: '500'
            }}>
              Authentication Status
            </td>
            <td style={{ 
              padding: '12px', 
              borderBottom: '1px solid #dee2e6'
            }}>
              <span style={{ 
                color: isLoggedIn ? '#28a745' : '#dc3545',
                fontWeight: 'bold'
              }}>
                {isLoggedIn ? '✅ Authenticated' : '❌ Not Authenticated'}
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px', 
              borderBottom: '1px solid #dee2e6',
              fontWeight: '500'
            }}>
              JWT Token
            </td>
            <td style={{ 
              padding: '12px', 
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'monospace',
              fontSize: '12px',
              backgroundColor: '#f1f3f4',
              wordBreak: 'break-all'
            }}>
              {token ? 
                `${token.substring(0, 50)}...` : 
                'No token available'
              }
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px', 
              fontWeight: '500'
            }}>
              Session Info
            </td>
            <td style={{ 
              padding: '12px',
              fontFamily: 'monospace',
              backgroundColor: '#f1f3f4'
            }}>
              Active session since login
            </td>
          </tr>
        </tbody>
      </table>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        <button 
          onClick={handleLogout}
          className="form-button"
          style={{ 
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>
        
        <button 
          onClick={() => window.history.back()}
          className="form-button"
          style={{ 
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Go Back
        </button>
      </div>

      {/* Developer Info */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px',
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>
          🔧 Developer Information
        </h4>
        <p style={{ margin: '5px 0' }}>
          <strong>Data Source:</strong> Retrieved from AuthContext
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>Authentication Method:</strong> JWT Token-based
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>Context Hook:</strong> useAuth() from AuthContext
        </p>
      </div>
    </div>
  );
};

export default UserProfile;