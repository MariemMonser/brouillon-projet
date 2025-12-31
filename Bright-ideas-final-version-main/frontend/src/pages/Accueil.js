import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PostIdea from '../components/PostIdea';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ReportModal from '../components/ReportModal';
import '../styles/accueil.css';
import bgImage from '../assets/bright-ideas-bg.jpg';

const Acceuil = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [likingIdeas, setLikingIdeas] = useState(new Set()); // Track which ideas are being liked
  const [commentingIdeas, setCommentingIdeas] = useState(new Set()); // Track which ideas are being commented on
  const [commentTexts, setCommentTexts] = useState({}); // Store comment text for each idea
  const [showComments, setShowComments] = useState({}); // Track which ideas show comments section
  const [reportModal, setReportModal] = useState({ isOpen: false, type: 'idea', ideaId: null, commentId: null });
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
    if (userData.role === 'admin') {
      navigate('/admin');
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
    fetchIdeas();
  }, [navigate]);

  const fetchIdeas = async () => {
    try {
      setIdeasLoading(true);
      const response = await fetch('http://localhost:5000/api/ideas', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error fetching ideas');
      }

      setIdeas(data.ideas || []);
    } catch (err) {
      console.error('Error fetching ideas:', err);
    } finally {
      setIdeasLoading(false);
    }
  };

  const handleLikeIdea = async (ideaId) => {
    if (!user) return;
    
    // Prevent multiple clicks
    if (likingIdeas.has(ideaId)) return;
    
    setLikingIdeas(prev => new Set(prev).add(ideaId));

    try {
      const response = await fetch(`http://localhost:5000/api/ideas/${ideaId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error liking idea');
      }

      // Update the idea in the list
      setIdeas(prevIdeas => 
        prevIdeas.map(idea => {
          if (idea._id === ideaId) {
            const currentLikes = idea.likes || [];
            const updatedLikes = data.isLiked
              ? [...currentLikes.filter(id => {
                  const likeId = typeof id === 'object' ? id._id : id;
                  return likeId.toString() !== user._id.toString();
                }), { _id: user._id }]
              : currentLikes.filter(id => {
                  const likeId = typeof id === 'object' ? id._id : id;
                  return likeId.toString() !== user._id.toString();
                });
            
            return {
              ...idea,
              likes: updatedLikes
            };
          }
          return idea;
        })
      );
    } catch (err) {
      console.error('Error liking idea:', err);
    } finally {
      setLikingIdeas(prev => {
        const newSet = new Set(prev);
        newSet.delete(ideaId);
        return newSet;
      });
    }
  };

  const isIdeaLiked = (idea) => {
    if (!user || !idea.likes) return false;
    return idea.likes.some(likeId => 
      (typeof likeId === 'object' ? likeId._id : likeId).toString() === user._id.toString()
    );
  };

  const handleAddComment = async (ideaId) => {
    if (!user) return;
    
    const commentText = commentTexts[ideaId]?.trim();
    if (!commentText || commentText.length === 0) {
      setError(t('errors.commentEmpty'));
      return;
    }

    if (commentingIdeas.has(ideaId)) return;
    
    setCommentingIdeas(prev => new Set(prev).add(ideaId));
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/ideas/${ideaId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: commentText }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error adding comment');
      }

      // Clear the comment input
      setCommentTexts(prev => {
        const newTexts = { ...prev };
        delete newTexts[ideaId];
        return newTexts;
      });

      // Refresh ideas to get updated comments
      await fetchIdeas();
    } catch (err) {
      setError(err.message || 'Error adding comment');
    } finally {
      setCommentingIdeas(prev => {
        const newSet = new Set(prev);
        newSet.delete(ideaId);
        return newSet;
      });
    }
  };

  const handleCommentTextChange = (ideaId, text) => {
    setCommentTexts(prev => ({
      ...prev,
      [ideaId]: text
    }));
  };

  const toggleShowComments = (ideaId) => {
    setShowComments(prev => ({
      ...prev,
      [ideaId]: !prev[ideaId]
    }));
  };

  const handleOpenReportModal = (type, ideaId, commentId = null) => {
    setReportModal({
      isOpen: true,
      type,
      ideaId,
      commentId
    });
  };

  const handleCloseReportModal = () => {
    setReportModal({
      isOpen: false,
      type: 'idea',
      ideaId: null,
      commentId: null
    });
  };

  const handleReport = async (reason) => {
    try {
      let url;
      if (reportModal.type === 'comment') {
        url = `http://localhost:5000/api/ideas/${reportModal.ideaId}/comments/${reportModal.commentId}/report`;
      } else {
        url = `http://localhost:5000/api/ideas/${reportModal.ideaId}/report`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t('report.errorReporting'));
      }

      setSuccess(reportModal.type === 'comment' ? t('success.commentReported') : t('success.ideaReported'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      throw err;
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
      setSuccess(t('success.profileUpdated'));
      setLoading(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    if (!passwordData.oldPassword) { setError(t('profile.enterOldPassword')); return; }
    if (!passwordData.newPassword) { setError(t('profile.enterNewPassword')); return; }
    if (passwordData.newPassword.length < 8) { setError(t('profile.passwordMinLength')); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { setError(t('profile.passwordsDontMatch')); return; }

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
      setSuccess(t('success.passwordChanged'));
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '', showOld: false, showNew: false, showConfirm: false });
      setLoading(false);
    } catch (err) {
      setError(err.message || "Erreur lors du changement de mot de passe");
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05060a', color: '#fff' }}><p>{t('common.loading')}</p></div>;
  }

  const profilePhotoSrc = editData.profilePhoto || user.profilePhoto || null;
  const userInitial = (user.name || user.alias || 'U').charAt(0).toUpperCase();

  return (
    <div className="app-root">
      <div className="bg-hero" aria-hidden="true" style={{ backgroundImage: `url(${bgImage})` }} />

      {/* SIDEBAR GAUCHE (Navigation) */}
      <aside className="sidebar" aria-label="Navigation">
        <div className="sidebar-top">
          <div className="sidebar-brand">{t('common.brightIdeas')}</div>
          
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
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main menu">
          <Link to="/accueil" className="nav-item active">{t('nav.home')}</Link>
          <Link to="/my-ideas" className="nav-item">{t('nav.myIdeas')}</Link>
          <Link to="/statistics" className="nav-item">{t('nav.statistics')}</Link>

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
            {t('nav.profile')}
            <span className={`dropdown-arrow-sidebar ${showDropdown ? 'open' : ''}`}>▼</span>
          </div>

          {showDropdown && (
            <div className="dropdown-submenu" id="profile-submenu">
              <button className="dropdown-submenu-item" onClick={() => { 
                setShowProfileModal(true); 
                setActiveTab('info'); 
                setShowDropdown(false);
              }}>{t('nav.personalInfo')}</button>
              <button className="dropdown-submenu-item" onClick={() => { 
                setShowProfileModal(true); 
                setActiveTab('password'); 
                setShowDropdown(false);
              }}>{t('nav.changePassword')}</button>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>{t('nav.logout')}</button>
        </div>
      </aside>

      {/* CONTENEUR PRINCIPAL (Contenu central) */}
      <div className="main-content-wrapper">
        <section className="hero-section glass-hero hero-improved" role="banner" aria-label="Page header">
          <div className="hero-left hero-left-improved">
            <h1 className="hero-title hero-title-improved">{t('home.title')}</h1>
            <div className="hero-accent" aria-hidden="true" />
            <p className="hero-subtitle hero-subtitle-improved">{t('home.subtitle')}</p>
          </div>
        </section>

        <main className="main-content">
          {/* ⭐ NOUVELLE SECTION : Poster une idée */}
          <PostIdea user={user} onIdeaPosted={fetchIdeas} />

          {/* Fil d'actualités */}
          <div className="panel card-panel">
            <h2>🚀 {t('home.feed')}</h2>
            {error && (
              <div style={{ 
                padding: '12px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                borderRadius: '8px', 
                color: '#ef4444', 
                marginBottom: '15px',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}
            {ideasLoading ? (
              <p>{t('home.loadingIdeas')}</p>
            ) : ideas.length === 0 ? (
              <p>{t('home.noIdeas')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                {ideas.map((idea) => (
                  <div key={idea._id} className="panel card-panel" style={{ 
                    margin: 0, 
                    background: 'linear-gradient(135deg, rgba(18,16,28,0.95), rgba(24,20,35,0.98))',
                    border: '1px solid rgba(124,73,245,0.25)',
                    color: '#fff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
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
                          {idea.author?.alias || idea.author?.name || t('common.unknown')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                          {new Date(idea.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
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
                      <button
                        onClick={() => handleLikeIdea(idea._id)}
                        disabled={likingIdeas.has(idea._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'transparent',
                          border: 'none',
                          color: isIdeaLiked(idea) ? '#ef4444' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          fontSize: '0.95rem',
                          fontWeight: isIdeaLiked(idea) ? 'bold' : 'normal'
                        }}
                        onMouseEnter={(e) => {
                          if (!isIdeaLiked(idea)) {
                            e.target.style.background = 'rgba(124,73,245,0.1)';
                            e.target.style.color = '#fff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isIdeaLiked(idea)) {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'rgba(255,255,255,0.7)';
                          }
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>
                          {isIdeaLiked(idea) ? '❤️' : '🤍'}
                        </span>
                        <span>{idea.likes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => toggleShowComments(idea._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          fontSize: '0.95rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(124,73,245,0.1)';
                          e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = 'rgba(255,255,255,0.7)';
                        }}
                      >
                        <span>💬</span>
                        <span>{idea.comments?.length || 0} {t('home.comments')}</span>
                      </button>
                      <button
                        onClick={() => handleOpenReportModal('idea', idea._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          fontSize: '0.95rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.target.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = 'rgba(255,255,255,0.7)';
                        }}
                        title={t('report.reportIdea')}
                      >
                        <span>🚩</span>
                        <span>{t('report.reportButton')}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[idea._id] && (
                      <div style={{ 
                        marginTop: '20px', 
                        paddingTop: '20px', 
                        borderTop: '1px solid rgba(255,255,255,0.1)' 
                      }}>
                        {/* Display existing comments */}
                        {idea.comments && idea.comments.length > 0 && (
                          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {idea.comments.map((comment, idx) => (
                              <div key={idx} style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                padding: '12px',
                                background: 'rgba(124,73,245,0.05)',
                                borderRadius: '8px',
                                border: '1px solid rgba(124,73,245,0.1)'
                              }}>
                                {comment.user?.profilePhoto ? (
                                  <img 
                                    src={comment.user.profilePhoto} 
                                    alt={comment.user.alias || comment.user.name}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem'
                                  }}>
                                    {(comment.user?.name || comment.user?.alias || 'U').charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>
                                        {comment.user?.alias || comment.user?.name || t('common.unknown')}
                                      </span>
                                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                        {new Date(comment.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleOpenReportModal('comment', idea._id, comment._id)}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                        e.target.style.color = '#ef4444';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = 'rgba(255,255,255,0.5)';
                                      }}
                                      title={t('report.reportComment')}
                                    >
                                      🚩 {t('report.reportButton')}
                                    </button>
                                  </div>
                                  <p style={{ 
                                    color: 'rgba(255,255,255,0.9)', 
                                    margin: 0, 
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                  }}>
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment input form */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          {user?.profilePhoto ? (
                            <img 
                              src={user.profilePhoto} 
                              alt={user.alias || user.name}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.85rem'
                            }}>
                              {(user?.name || user?.alias || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea
                              value={commentTexts[idea._id] || ''}
                              onChange={(e) => handleCommentTextChange(idea._id, e.target.value)}
                              placeholder={t('home.writeComment')}
                              style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(124,73,245,0.3)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.9rem',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                              }}
                              maxLength={500}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                {(commentTexts[idea._id] || '').length}/500
                              </span>
                              <button
                                onClick={() => handleAddComment(idea._id)}
                                disabled={commentingIdeas.has(idea._id) || !commentTexts[idea._id]?.trim()}
                                style={{
                                  padding: '8px 16px',
                                  background: commentingIdeas.has(idea._id) || !commentTexts[idea._id]?.trim()
                                    ? 'rgba(124,73,245,0.3)'
                                    : 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: '#fff',
                                  cursor: commentingIdeas.has(idea._id) || !commentTexts[idea._id]?.trim() ? 'not-allowed' : 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {commentingIdeas.has(idea._id) ? t('home.posting') : t('home.postComment')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SIDEBAR DROITE (Contenu futur) */}
      <aside className="right-sidebar" aria-label="Future Content">
        <div className="sidebar-panel">
          <h3 className="sidebar-title">Tendances</h3>
          <p className="sidebar-text">Les idées les plus populaires de la semaine</p>
          <div className="future-content-placeholder">
            <p>💡 Innovation Tech</p>
            <p>🌍 Environnement</p>
            <p>🎨 Design & Art</p>
          </div>
        </div>
      </aside>

      {/* MODAL (inchangée) */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-container modal-profile-improved" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('profile.profileSettings')}</h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>

            <div className="modal-body modal-body-improved">
              
              <div className="profile-nav-sidebar">
                <button 
                  className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`} 
                  onClick={() => { setActiveTab('info'); setError(''); setSuccess(''); }}
                >
                  <span className="icon">👤</span> {t('nav.personalInfo')}
                </button>
                <button 
                  className={`profile-nav-item ${activeTab === 'password' ? 'active' : ''}`} 
                  onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
                >
                  <span className="icon">🔒</span> {t('nav.changePassword')}
                </button>
              </div>

              <div className="profile-content-area">

                {activeTab === 'info' && (
                  <div className="tab-content-info">
                    <h3 className="content-title">{t('profile.updateDetails')}</h3>
                    <p className="content-subtitle">{t('profile.updateDetailsSubtitle')}</p>

                    <div className="profile-photo-section">
                      <div className="profile-photo-preview">
                        {editData.profilePhoto ? <img src={editData.profilePhoto} alt="Preview" /> : userInitial}
                      </div>
                      <div className="photo-upload-wrapper">
                        <label htmlFor="photo-upload" className="photo-upload-label">
                          📷 {t('profile.choosePhoto')}
                        </label>
                        <input 
                          id="photo-upload"
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoChange} 
                          className="photo-upload-input" 
                        />
                        <span className="photo-upload-hint">{t('profile.photoHint')}</span>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">👤 {t('profile.fullName')}</label>
                        <input id="name" type="text" value={editData.name} onChange={handleInfoChange} className="form-input" placeholder={t('auth.enterName')} />
                      </div>

                      <div className="form-group">
                        <label htmlFor="alias" className="form-label">✨ {t('profile.username')}</label>
                        <input id="alias" type="text" value={editData.alias} onChange={handleInfoChange} className="form-input" placeholder={t('auth.enterUsername')} />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">📧 {t('profile.emailAddress')}</label>
                        <input id="email" type="email" value={editData.email} onChange={handleInfoChange} className="form-input" placeholder={t('auth.enterEmail')} />
                      </div>

                      <div className="form-group">
                        <label htmlFor="dateOfBirth" className="form-label">🎂 {t('profile.dateOfBirth')}</label>
                        <input 
                          id="dateOfBirth" 
                          type="date" 
                          value={editData.dateOfBirth} 
                          onChange={handleInfoChange} 
                          className="form-input"
                          min="1965-01-01"
                          max="2010-12-31"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="address" className="form-label">🏠 {t('profile.address')}</label>
                      <textarea id="address" value={editData.address} onChange={handleInfoChange} rows="3" className="form-input" placeholder={t('auth.enterAddress')} />
                    </div>
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <div className="form-actions">
                      <button onClick={handleSaveInfo} disabled={loading} className="btn btn-primary">{loading ? `⏳ ${t('profile.saving')}` : `✓ ${t('profile.saveChanges')}`}</button>
                      <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary">{t('common.cancel')}</button>
                    </div>
                  </div>
                )}

                {activeTab === 'password' && (
                  <div className="tab-content-password">
                    <h3 className="content-title">{t('profile.changePasswordTitle')}</h3>
                    <p className="content-subtitle">{t('profile.changePasswordSubtitle')}</p>

                    <div className="form-group">
                      <label htmlFor="oldPassword" className="form-label">{t('auth.oldPassword')}</label>
                      <div className="password-input-wrapper">
                        <input id="oldPassword" type={passwordData.showOld ? 'text' : 'password'} value={passwordData.oldPassword} onChange={handlePasswordChange} className="form-input" />
                        <button type="button" onClick={() => setPasswordData({ ...passwordData, showOld: !passwordData.showOld })} className="toggle-password">{passwordData.showOld ? '👁️' : '👁️‍🗨️'}</button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword" className="form-label">{t('auth.newPassword')}</label>
                      <div className="password-input-wrapper">
                        <input id="newPassword" type={passwordData.showNew ? 'text' : 'password'} value={passwordData.newPassword} onChange={handlePasswordChange} className="form-input" />
                        <button type="button" onClick={() => setPasswordData({ ...passwordData, showNew: !passwordData.showNew })} className="toggle-password">{passwordData.showNew ? '👁️' : '👁️‍🗨️'}</button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">{t('auth.confirmPassword')}</label>
                      <div className="password-input-wrapper">
                        <input id="confirmPassword" type={passwordData.showConfirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={handlePasswordChange} className="form-input" />
                        <button type="button" onClick={() => setPasswordData({ ...passwordData, showConfirm: !passwordData.showConfirm })} className="toggle-password">{passwordData.showConfirm ? '👁️' : '👁️‍🗨️'}</button>
                      </div>
                    </div>
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <div className="form-actions">
                      <button onClick={handleChangePassword} disabled={loading} className="btn btn-primary">{loading ? `⏳ ${t('profile.updating')}` : `✓ ${t('profile.updatePassword')}`}</button>
                      <button onClick={() => setShowProfileModal(false)} className="btn btn-secondary">{t('common.cancel')}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={handleCloseReportModal}
        onReport={handleReport}
        type={reportModal.type}
      />
    </div>
  );
};

export default Acceuil;