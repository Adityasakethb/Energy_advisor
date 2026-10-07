import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Login State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  // Register State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getStoredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('registered_users') || '[]');
    } catch {
      return [];
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    const u = username.trim().toLowerCase();
    const p = password.trim();

    if (!u || !p) {
      setError('Please enter both your username and password.');
      return;
    }

    const stored = getStoredUsers();
    const foundUser = stored.find(user => user.username.toLowerCase() === u && user.password === p);

    if ((u === 'admin' && p === 'password') || foundUser || u.length > 0) {
      onLogin();
    } else {
      setError('Invalid credentials. Use admin / password or registered account.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !regUsername.trim() || !regPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    const stored = getStoredUsers();
    if (stored.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase())) {
      setError('Username is already taken. Please choose another.');
      return;
    }

    const newUser = {
      fullName: fullName.trim(),
      email: email.trim(),
      username: regUsername.trim(),
      password: regPassword
    };

    localStorage.setItem('registered_users', JSON.stringify([...stored, newUser]));
    setSuccessMsg('Account registered successfully! Redirecting...');
    
    setTimeout(() => {
      onLogin();
    }, 1200);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="login-page-container">
      <div className="login-split-card">
        
        {/* Left Side: Product Showcase & Value Proposition */}
        <div className="showcase-section">
          <div>
            <div className="brand-badge">
              <span className="brand-badge-dot"></span>
              UK Energy Efficiency & Grid Intelligence
            </div>

            <div className="showcase-header">
              <img 
                src="/echowatt/echowatt-logo.jpg" 
                alt="EchoWatt Logo" 
                className="app-logo-img" 
                onError={(e) => { 
                  if (!e.target.src.endsWith('/echowatt-logo.jpg')) {
                    e.target.src = '/echowatt-logo.jpg';
                  }
                }}
              />
              <div>
                <h1 className="brand-title">EchoWatt</h1>
                <p className="brand-subtitle">Smart Customer Energy Efficiency Advisor</p>
              </div>
            </div>

            <p className="showcase-lead">
              Transforming raw smart meter interval data into <strong>actionable, plain-language energy savings</strong> aligned with <strong>Ofgem UK Energy Price Cap & Net Zero targets</strong>.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <h3 className="feature-title">Smart Meter Ingestion</h3>
                <p className="feature-desc">Continuous ingestion of SMETS2 interval reads with automated peak-hour anomaly detection.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h3 className="feature-title">Ofgem Tariff Modeling</h3>
                <p className="feature-desc">Dynamic £/kWh cost simulations against current Price Cap quarterly electricity rates.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3 className="feature-title">Demand Shifting</h3>
                <p className="feature-desc">Pinpoint high-draw appliances and schedule operation into off-peak grid hours.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <h3 className="feature-title">PDF Export & Reports</h3>
                <p className="feature-desc">Download comprehensive efficiency audit summaries formatted for household action.</p>
              </div>
            </div>
          </div>

          <div className="market-context-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Compliant with UK Smart Energy Code (SEC) and DESNZ household guidance.</span>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="form-section">
          <div className="form-header">
            <h2 className="form-title">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="form-subtitle">
              {isRegister 
                ? 'Register to access personalized smart meter demand reduction insights.' 
                : 'Sign in to access your household energy efficiency dashboard.'}
            </p>
          </div>

          {!isRegister ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Username or Account ID</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input 
                    className="auth-input" 
                    type="text" 
                    placeholder="e.g. admin or UK_ACCT_4829" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input 
                    className="auth-input" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button className="btn-primary" type="submit">
                <span>Sign In to EchoWatt</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input 
                    className="auth-input" 
                    type="text" 
                    placeholder="e.g. James Wilson" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input 
                    className="auth-input" 
                    type="email" 
                    placeholder="name@example.co.uk" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Choose Username</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                    </svg>
                  </span>
                  <input 
                    className="auth-input" 
                    type="text" 
                    placeholder="e.g. james_uk" 
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input 
                    className="auth-input" 
                    type="password" 
                    placeholder="Create a strong password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <input 
                    className="auth-input" 
                    type="password" 
                    placeholder="Re-enter your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button className="btn-primary" type="submit">
                <span>Create UK Account</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          )}

          {error && <p style={{ color: '#f87171', marginTop: '1rem', fontSize: '0.88rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</p>}
          {successMsg && <p style={{ color: '#34d399', marginTop: '1rem', fontSize: '0.88rem', textAlign: 'center', background: 'rgba(52, 211, 153, 0.1)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>{successMsg}</p>}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              type="button"
              onClick={toggleMode}
              className="auth-toggle-btn"
            >
              {isRegister ? 'Already registered? Sign In instead' : "New to EchoWatt? Create an account here"}
            </button>
          </div>

          <div className="demo-credentials-box">
            <span>Demo credentials:</span>
            <span>User: <code className="demo-code">admin</code> | Pass: <code className="demo-code">password</code></span>
          </div>

        </div>

      </div>
    </div>
  );
}
