// src/pages/Statistics.js

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/accueil.css';
import bgImage from '../assets/bright-ideas-bg.jpg';

const Statistics = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/ideas/my-ideas', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to load ideas');

      const ideas = data.ideas || [];
      const totalIdeas = ideas.length;
      const totalLikes = ideas.reduce((acc, idea) => acc + (idea.likes?.length || 0), 0);
      const totalComments = ideas.reduce((acc, idea) => acc + (idea.comments?.length || 0), 0);
      const avgLikes = totalIdeas > 0 ? (totalLikes / totalIdeas).toFixed(1) : 0;

      const mostLikedIdea = ideas.reduce((prev, current) => 
        (prev.likes?.length || 0) > (current.likes?.length || 0) ? prev : current, 
        ideas[0] || null
      );

      setStats({ totalIdeas, totalLikes, totalComments, avgLikes, mostLikedIdea });
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  if (!user) return null;

  const userInitial = (user.name || user.alias || 'U').charAt(0).toUpperCase();
  const profilePhotoSrc = user.profilePhoto || null;

  return (
    <div className="app-root">
      <div className="bg-hero" aria-hidden="true" style={{ backgroundImage: `url(${bgImage})` }} />

      {/* EXACT SAME SIDEBAR AS ACCUEIL */}
      <aside className="sidebar" aria-label="Navigation">
        <div className="sidebar-top">
          <div className="sidebar-brand">💡 Bright Ideas</div>
          
          <div className="sidebar-profile-section" role="button" tabIndex={0}>
            {profilePhotoSrc ? 
              <img src={profilePhotoSrc} alt="profile" className="sidebar-avatar" /> : 
              <div className="sidebar-avatar-initial">{userInitial}</div>
            }
            <div className="sidebar-username">{user.alias || user.name}</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main menu">
          <Link to="/accueil" className="nav-item">Home</Link>
          <Link to="/my-ideas" className="nav-item">My Ideas</Link>
          <Link to="/statistics" className="nav-item active">Statistics</Link>
          <div className="nav-item profile-item">Profile ▼</div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT - Same structure as Accueil */}
      <div className="main-content-wrapper">
        <section className="hero-section glass-hero hero-improved" role="banner">
          <div className="hero-left hero-left-improved">
            <h1 className="hero-title hero-title-improved">My Statistics</h1>
            <div className="hero-accent" aria-hidden="true" />
            <p className="hero-subtitle hero-subtitle-improved">Track your impact and growth on Bright Ideas</p>
          </div>
        </section>

        <main className="main-content">
          <div className="panel card-panel">
            {loading ? (
              <p>Chargement des statistiques...</p>
            ) : !stats || stats.totalIdeas === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
                <h3>Aucune statistique disponible</h3>
                <p>Commencez à publier des idées pour voir vos statistiques !</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <div className="panel" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '48px', color: '#7c49f5' }}>{stats.totalIdeas}</div>
                    <p>Total Ideas Posted</p>
                  </div>
                  <div className="panel" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '48px', color: '#ef4444' }}>{stats.totalLikes}</div>
                    <p>Likes Received</p>
                  </div>
                  <div className="panel" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '48px', color: '#00d9ff' }}>{stats.avgLikes}</div>
                    <p>Average Likes</p>
                  </div>
                  <div className="panel" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '48px', color: '#00d9ff' }}>{stats.totalComments}</div>
                    <p>Comments Received</p>
                  </div>
                </div>

                {stats.mostLikedIdea && (
                  <div className="panel" style={{ padding: '30px' }}>
                    <h3>🌟 Your Most Popular Idea</h3>
                    <p style={{ fontStyle: 'italic', margin: '20px 0' }}>
                      "{stats.mostLikedIdea.text.substring(0, 300)}{stats.mostLikedIdea.text.length > 300 ? '...' : ''}"
                    </p>
                    <p style={{ color: '#ef4444', fontWeight: 'bold' }}>
                      ❤️ {stats.mostLikedIdea.likes?.length || 0} likes
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Right sidebar placeholder (same as Accueil) */}
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
    </div>
  );
};

export default Statistics;