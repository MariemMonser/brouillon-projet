import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/accueil.css';
import bgImage from '../assets/bright-ideas-bg.jpg';

const MyIdeas = () => {
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ text: '' });
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role === 'admin') {
      navigate('/admin');
      return;
    }

    setUser(userData);
    fetchMyIdeas();
  }, [navigate]);

  const fetchMyIdeas = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/ideas/my-ideas', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error fetching ideas');
      }

      setIdeas(data.ideas || []);
    } catch (err) {
      setError(err.message || 'Error loading ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleEditIdea = (idea) => {
    setEditingId(idea._id);
    setEditData({ text: idea.text || '' });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveEdit = async () => {
    setError('');
    setSuccess('');
    setEditLoading(true);

    if (!editData.text || editData.text.trim().length < 10) {
      setError('Le texte doit contenir au moins 10 caractères');
      setEditLoading(false);
      return;
    }

    if (editData.text.length > 2000) {
      setError('Le texte ne peut pas dépasser 2000 caractères');
      setEditLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ideas/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: editData.text.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error updating idea');
      }

      setSuccess('Idée modifiée avec succès !');
      setShowEditModal(false);
      setEditingId(null);
      setEditData({ text: '' });

      // Refresh the ideas list
      setTimeout(() => {
        fetchMyIdeas();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error updating idea');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/ideas/${ideaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error deleting idea');
      }

      // Remove the idea from the list
      setIdeas(ideas.filter(idea => idea._id !== ideaId));
    } catch (err) {
      setError(err.message || 'Error deleting idea');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (!user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05060a', color: '#fff' }}><p>Chargement...</p></div>;
  }

  const profilePhotoSrc = user.profilePhoto || null;
  const userInitial = (user.name || user.alias || 'U').charAt(0).toUpperCase();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app-root">
      <div className="bg-hero" aria-hidden="true" style={{ backgroundImage: `url(${bgImage})` }} />

      {/* SIDEBAR GAUCHE */}
      <aside className="sidebar" aria-label="Navigation">
        <div className="sidebar-top">
          <div className="sidebar-brand">💡 Bright Ideas</div>
          
          <div
            className="sidebar-profile-section"
            role="button" tabIndex={0}
          >
            {profilePhotoSrc ? 
              <img src={profilePhotoSrc} alt="profile" className="sidebar-avatar" /> : 
              <div className="sidebar-avatar-initial">{userInitial}</div>
            }
            <div className="sidebar-username">{user.alias || user.name}</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main menu">
          <Link to="/accueil" className="nav-item">Home</Link>
          <Link to="/my-ideas" className="nav-item active">My Ideas</Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* CONTENEUR PRINCIPAL */}
      <div className="main-content-wrapper">
        <section className="hero-section glass-hero hero-improved" role="banner">
          <div className="hero-left hero-left-improved">
            <h1 className="hero-title hero-title-improved">My Ideas</h1>
            <div className="hero-accent" aria-hidden="true" />
            <p className="hero-subtitle hero-subtitle-improved">All your published ideas in one place.</p>
          </div>
        </section>

        <main className="main-content">
          {error && (
            <div className="panel card-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <p style={{ color: '#ef4444' }}>⚠️ {error}</p>
            </div>
          )}

          {success && (
            <div className="panel card-panel" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <p style={{ color: '#22c55e' }}>✓ {success}</p>
            </div>
          )}

          {loading ? (
            <div className="panel card-panel">
              <p>Loading your ideas...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="panel card-panel">
              <h2>No ideas yet</h2>
              <p>You haven't published any ideas yet. Start sharing your thoughts!</p>
              <a href="/accueil" style={{ color: 'var(--accent-violet)', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }}>
                → Go to Home to post an idea
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {ideas.map((idea) => (
                <div key={idea._id} className="panel card-panel" style={{ 
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(18,16,28,0.95), rgba(24,20,35,0.98))',
                  border: '1px solid rgba(124,73,245,0.25)',
                  color: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {idea.author?.profilePhoto ? (
                        <img 
                          src={idea.author.profilePhoto} 
                          alt={idea.author.alias || idea.author.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {(idea.author?.name || idea.author?.alias || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>
                          {idea.author?.alias || idea.author?.name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                          {formatDate(idea.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleEditIdea(idea)}
                        style={{
                          background: 'rgba(124, 73, 245, 0.1)',
                          border: '1px solid rgba(124, 73, 245, 0.3)',
                          color: '#7c49f5',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea._id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <p style={{ 
                    color: '#fff', 
                    lineHeight: '1.6', 
                    marginBottom: '15px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {idea.text}
                  </p>

                  {idea.image && (
                    <div style={{ marginBottom: '15px', borderRadius: '12px', overflow: 'hidden' }}>
                      <img 
                        src={idea.image} 
                        alt="Idea" 
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)' }}>
                      <span>❤️</span>
                      <span>{idea.likes?.length || 0} likes</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)' }}>
                      <span>💬</span>
                      <span>{idea.comments?.length || 0} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal Édition */}
      {showEditModal && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            setShowEditModal(false);
            setEditingId(null);
            setEditData({ text: '' });
            setError('');
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(18,16,28,0.98), rgba(24,20,35,0.98))',
              border: '1px solid rgba(124,73,245,0.3)',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>Modifier l'idée</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingId(null);
                  setEditData({ text: '' });
                  setError('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '5px 10px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '10px', fontWeight: '500' }}>
                Texte de l'idée
              </label>
              <textarea
                value={editData.text}
                onChange={(e) => setEditData({ text: e.target.value })}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '15px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(124,73,245,0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                maxLength={2000}
              />
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px', textAlign: 'right' }}>
                {editData.text.length} / 2000 caractères
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#ef4444', margin: 0 }}>⚠️ {error}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingId(null);
                  setEditData({ text: '' });
                  setError('');
                }}
                disabled={editLoading}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  opacity: editLoading ? 0.5 : 1
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #7c49f5, #00d9ff)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  opacity: editLoading ? 0.5 : 1
                }}
              >
                {editLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyIdeas;

