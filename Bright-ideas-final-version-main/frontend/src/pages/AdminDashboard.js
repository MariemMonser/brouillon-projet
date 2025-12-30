import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageUsers from '../components/ManageUsers';
import ModerateIdeas from '../components/ModerateIdeas';
import '../styles/AdminDashboard.css';
import bgImage from '../assets/bright-ideas-bg.jpg';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard'); // Pour switcher entre sections
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    name: '',
    alias: '',
    email: '',
    dateOfBirth: '',
    address: '',
    profilePhoto: null,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    showOld: false,
    showNew: false,
    showConfirm: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      navigate('/accueil');
      return;
    }

    setUser(userData);
    setEditData({
      name: userData.name || '',
      alias: userData.alias || '',
      email: userData.email || '',
      dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
      address: userData.address || '',
      profilePhoto: userData.profilePhoto || null,
    });
    fetchStatistics();
  }, [navigate]);

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('http://localhost:5000/api/ideas/statistics', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error fetching statistics');
      }

      setStatistics(data.statistics);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Error loading statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const handleInfoChange = (e) => {
    setEditData({ ...editData, [e.target.id]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
  };

  const handleSaveInfo = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const bodyData = {
        name: editData.name,
        alias: editData.alias,
        email: editData.email,
        dateOfBirth: editData.dateOfBirth,
        address: editData.address,
      };
      if (editData.profilePhoto && editData.profilePhoto.startsWith('data:')) {
        bodyData.profilePhoto = editData.profilePhoto;
      }
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bodyData),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Erreur lors de la mise à jour");
      const updatedUser = { ...data.user, profilePhoto: editData.profilePhoto || data.user.profilePhoto };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Informations mises à jour avec succès !');
      setLoading(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    if (!passwordData.oldPassword) { setError('Veuillez saisir votre ancien mot de passe'); return; }
    if (!passwordData.newPassword) { setError('Veuillez saisir votre nouveau mot de passe'); return; }
    if (passwordData.newPassword.length < 8) { setError('Le nouveau mot de passe doit contenir au moins 8 caractères'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Erreur lors du changement de mot de passe");
      setSuccess('Mot de passe changé avec succès !');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '', showOld: false, showNew: false, showConfirm: false });
      setLoading(false);
    } catch (err) {
      setError(err.message || "Erreur lors du changement de mot de passe");
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05060a', color: '#fff' }}><p>Chargement...</p></div>;
  }

  const profilePhotoSrc = editData.profilePhoto || user.profilePhoto || null;
  const userInitial = (user.name || user.alias || 'A').charAt(0).toUpperCase();

  return (
    <div className="admin-root">
      <div className="bg-hero" aria-hidden="true" style={{ backgroundImage: `url(${bgImage})` }} />

      {/* SIDEBAR GAUCHE */}
      <aside className="sidebar" aria-label="Navigation">
        <div className="sidebar-top">
          <div className="sidebar-brand">💡 Bright Ideas</div>
          
          <div
            className="sidebar-profile-section"
            onClick={() => { setShowProfileModal(true); setActiveTab('info'); }}
            role="button" tabIndex={0} aria-label="Edit profile"
          >
            {profilePhotoSrc ? 
              <img src={profilePhotoSrc} alt="profile" className="sidebar-avatar" /> : 
              <div className="sidebar-avatar-initial">{userInitial}</div>
            }
            <div className="sidebar-username">{user.alias || user.name}</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main menu">
          <a 
            href="#dashboard" 
            onClick={() => setActiveSection('dashboard')}
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </a>
          <a 
            href="#users" 
            onClick={() => setActiveSection('users')}
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
          >
            Gestion Utilisateurs
          </a>
          <a 
            href="#ideas" 
            onClick={() => setActiveSection('ideas')}
            className={`nav-item ${activeSection === 'ideas' ? 'active' : ''}`}
          >
            Modération Idées
          </a>

          <div
            className="nav-item profile-item"
            onClick={(e) => { 
              e.stopPropagation(); 
              setShowDropdown(!showDropdown); 
            }}
            role="button" tabIndex={0}
            aria-expanded={showDropdown}
            aria-controls="profile-submenu"
          >
            Profil Admin
            <span className={`dropdown-arrow-sidebar ${showDropdown ? 'open' : ''}`}>▼</span>
          </div>

          {showDropdown && (
            <div className="dropdown-submenu" id="profile-submenu">
              <button className="dropdown-submenu-item" onClick={() => { 
                setShowProfileModal(true); 
                setActiveTab('info'); 
                setShowDropdown(false);
              }}>Informations Personnelles</button>
              <button className="dropdown-submenu-item" onClick={() => { 
                setShowProfileModal(true); 
                setActiveTab('password'); 
                setShowDropdown(false);
              }}>Changer le Mot de Passe</button>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className="main-content-wrapper">
        <section className="hero-section glass-hero hero-improved admin-hero" role="banner">
          <div className="hero-left hero-left-improved">
            <h1 className="hero-title hero-title-improved">Administration Dashboard</h1>
            <div className="hero-accent" aria-hidden="true" />
            <p className="hero-subtitle hero-subtitle-improved">Gérez les utilisateurs, modérez le contenu et consultez les statistiques.</p>
          </div>
        </section>

        <main className="main-content">
          {/* SECTION DASHBOARD */}
          {activeSection === 'dashboard' && (
            <>
              {/* Stats Cards - SEULEMENT LES STATS */}
              {statsLoading ? (
                <div className="card-panel">
                  <p>Loading statistics...</p>
                </div>
              ) : statistics ? (
                <div className="stats-grid">
                  <div className="stat-card card-panel">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <h3>Total Utilisateurs</h3>
                      <p className="stat-number">{statistics.totalUsers.toLocaleString()}</p>
                      <span className={`stat-trend ${statistics.usersTrend > 0 ? 'up' : statistics.usersTrend < 0 ? 'down' : 'neutral'}`}>
                        {statistics.usersTrend > 0 ? '+' : ''}{statistics.usersTrend}% ce mois
                      </span>
                    </div>
                  </div>

                  <div className="stat-card card-panel">
                    <div className="stat-icon">💡</div>
                    <div className="stat-content">
                      <h3>Idées Publiées</h3>
                      <p className="stat-number">{statistics.totalIdeas.toLocaleString()}</p>
                      <span className={`stat-trend ${statistics.ideasTrend > 0 ? 'up' : statistics.ideasTrend < 0 ? 'down' : 'neutral'}`}>
                        {statistics.ideasTrend > 0 ? '+' : ''}{statistics.ideasTrend}% ce mois
                      </span>
                    </div>
                  </div>

                  <div className="stat-card card-panel">
                    <div className="stat-icon">❤️</div>
                    <div className="stat-content">
                      <h3>Total Likes</h3>
                      <p className="stat-number">{statistics.totalLikes?.toLocaleString() || 0}</p>
                      <span className="stat-trend neutral">Tous les likes</span>
                    </div>
                  </div>

                  <div className="stat-card card-panel">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                      <h3>Rapports en attente</h3>
                      <p className="stat-number">{statistics.totalReports}</p>
                      <span className="stat-trend neutral">À modérer</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-panel">
                  <p>No statistics available</p>
                </div>
              )}
            </>
          )}

          {/* SECTION GESTION UTILISATEURS */}
          {activeSection === 'users' && (
            <div className="card-panel users-section">
              <ManageUsers />
            </div>
          )}

          {/* SECTION MODÉRATION IDÉES */}
          {activeSection === 'ideas' && (
            <div className="card-panel users-section">
              <ModerateIdeas />
            </div>
          )}
        </main>
      </div>

      {/* MODAL PROFIL */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-container modal-profile-improved" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Profile Settings</h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>

            <div className="modal-body modal-body-improved">
              <div className="profile-nav-sidebar">
                <button 
                  className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`} 
                  onClick={() => { setActiveTab('info'); setError(''); setSuccess(''); }}
                >
                  <span className="icon">👤</span> Personal Information
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'password' ? 'active' : ''}`} 
                  onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
                >
                  <span className="icon">🔒</span> Change Password
                </button>
              </div>

              <div className="profile-content-area">
                {activeTab === 'info' && (
                  <div className="tab-content-info">
                    <h3 className="content-title">Update Your Personal Details</h3>
                    <p className="content-subtitle">Review and update your profile information. This will be visible to other users.</p>

                    <div className="profile-photo-section">
                      <div className="profile-photo-preview">
                        {editData.profilePhoto ? <img src={editData.profilePhoto} alt="Preview" /> : userInitial}
                      </div>
                      <div className="photo-upload-wrapper">
                        <label htmlFor="photo-upload" className="photo-upload-label">
                          📷 Choose Photo
                        </label>
                        <input 
                          id="photo-upload"
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoChange} 
                          className="photo-upload-input" 
                        />
                        <span className="photo-upload-hint">JPG, PNG or GIF (Max 5MB)</span>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">👤 Full Name</label>
                        <input id="name" type="text" value={editData.name} onChange={handleInfoChange} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="alias" className="form-label">✨ Username</label>
                        <input id="alias" type="text" value={editData.alias} onChange={handleInfoChange} className="form-input" />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">📧 Email</label>
                        <input id="email" type="email" value={editData.email} onChange={handleInfoChange} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="dateOfBirth" className="form-label">🎂 Date of Birth</label>
                        <input id="dateOfBirth" type="date" value={editData.dateOfBirth} onChange={handleInfoChange} className="form-input" min="1965-01-01" max="2010-12-31" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="address" className="form-label">🏠 Address</label>
                      <textarea id="address" value={editData.address} onChange={handleInfoChange} rows="3" className="form-input" />
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="form-actions">
                      <button onClick={handleSaveInfo} disabled={loading} className="btn btn-primary">{loading ? '⏳ Saving...' : '✓ Save Changes'}</button>
                      <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                )}

                {activeTab === 'password' && (
                  <div className="tab-content-password">
                    <h3 className="content-title">Change Your Password</h3>
                    <p className="content-subtitle">Use a strong password that you haven't used before.</p>

                    <div className="form-group">
                      <label htmlFor="oldPassword" className="form-label">Current Password</label>
                      <div className="password-input-wrapper">
                        <input id="oldPassword" type={passwordData.showOld ? 'text' : 'password'} value={passwordData.oldPassword} onChange={handlePasswordChange} className="form-input" />
                        <button type="button" onClick={() => setPasswordData({ ...passwordData, showOld: !passwordData.showOld })} className="toggle-password">{passwordData.showOld ? '👁️' : '👁️‍🗨️'}</button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword" className="form-label">New Password</label>
                      <div className="password-input-wrapper">
                        <input id="newPassword" type={passwordData.showNew ? 'text' : 'password'} value={passwordData.newPassword} onChange={handlePasswordChange} className="form-input" />
                        <button type="button" onClick={() => setPasswordData({ ...passwordData, showNew: !passwordData.showNew })} className="toggle-password">{passwordData.showNew ? '👁️' : '👁️‍🗨️'}</button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                      <div className="password-input-wrapper">
                        <input id="confirmPassword" type={passwordData.showConfirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={handlePasswordChange} className="form-input" />
                        <button type="button" onClick={() => setPasswordData({ ...passwordData, showConfirm: !passwordData.showConfirm })} className="toggle-password">{passwordData.showConfirm ? '👁️' : '👁️‍🗨️'}</button>
                      </div>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="form-actions">
                      <button onClick={handleChangePassword} disabled={loading} className="btn btn-primary">{loading ? '⏳ Updating...' : '✓ Update Password'}</button>
                      <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;