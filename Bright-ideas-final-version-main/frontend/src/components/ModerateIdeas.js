import React, { useState, useEffect } from 'react';
import '../styles/manageUsers.css';

const ModerateIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedIdeas, setExpandedIdeas] = useState(new Set()); // Track which ideas show comments
  const [ideaDetails, setIdeaDetails] = useState({}); // Store full idea details with comments

  const [editData, setEditData] = useState({
    text: '',
  });

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/ideas', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors du chargement des idées');
      }

      setIdeas(data.ideas || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des idées');
      setLoading(false);
    }
  };

  const handleEdit = (idea) => {
    setEditingId(idea._id);
    setEditData({
      text: idea.text || '',
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.id]: e.target.value });
  };

  const handleSaveEdit = async () => {
    setError('');
    setSuccess('');

    if (!editData.text || editData.text.trim().length < 10) {
      setError('Le texte doit contenir au moins 10 caractères');
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

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }

      setSuccess('Idée modifiée avec succès !');
      setShowModal(false);
      setEditingId(null);

      setTimeout(() => {
        fetchIdeas();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/ideas/${ideaId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      setSuccess('Idée supprimée avec succès !');
      setConfirmDelete(null);

      setTimeout(() => {
        fetchIdeas();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const filteredIdeas = ideas.filter(idea =>
    idea.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.author?.alias?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleToggleComments = async (ideaId) => {
    const isExpanded = expandedIdeas.has(ideaId);
    
    if (isExpanded) {
      // Collapse: remove from expanded set
      setExpandedIdeas(prev => {
        const newSet = new Set(prev);
        newSet.delete(ideaId);
        return newSet;
      });
    } else {
      // Expand: fetch full idea details with comments
      try {
        const response = await fetch(`http://localhost:5000/api/ideas/${ideaId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Erreur lors du chargement des détails');
        }

        // Store the idea details
        setIdeaDetails(prev => ({
          ...prev,
          [ideaId]: data.idea
        }));

        // Add to expanded set
        setExpandedIdeas(prev => new Set(prev).add(ideaId));
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des commentaires');
      }
    }
  };

  if (loading) {
    return (
      <div className="manage-users-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des idées...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <div className="manage-users-header">
        <div className="header-content">
          <h2>💡 Modération des Idées</h2>
          <div className="contact-count">
            <span className="count-number">{filteredIdeas.length}</span>
            <span className="count-text">Idée{filteredIdeas.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✓ {success}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Rechercher par texte, auteur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="empty-state">
          <p>Aucune idée trouvée</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Auteur</th>
                <th>Idée</th>
                <th>Likes</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.map((idea) => {
                const isExpanded = expandedIdeas.has(idea._id);
                const ideaWithComments = ideaDetails[idea._id] || idea;
                const comments = ideaWithComments.comments || [];
                
                return (
                  <React.Fragment key={idea._id}>
                    <tr 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleComments(idea._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(124, 73, 245, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {idea.author?.profilePhoto ? (
                            <img 
                              src={idea.author.profilePhoto} 
                              alt={idea.author.alias || idea.author.name}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              background: 'linear-gradient(135deg, #7c49f5, #00d9ff)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.85rem'
                            }}>
                              {(idea.author?.name || idea.author?.alias || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <strong>{idea.author?.alias || idea.author?.name || 'Unknown'}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{idea.author?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '400px' }}>
                          <p style={{ margin: 0, wordBreak: 'break-word' }}>
                            {idea.text.length > 100 ? idea.text.substring(0, 100) + '...' : idea.text}
                          </p>
                          {idea.image && (
                            <span style={{ fontSize: '0.75rem', color: '#666' }}>📷 Image incluse</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 'bold', color: '#7c49f5' }}>
                          ❤️ {idea.likes?.length || 0}
                        </span>
                        {comments.length > 0 && (
                          <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#666' }}>
                            💬 {comments.length}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#666' }}>
                        {formatDate(idea.createdAt)}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(idea)}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => setConfirmDelete(idea._id)}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="5" style={{ padding: '20px', backgroundColor: 'rgba(124, 73, 245, 0.03)' }}>
                          <div style={{ 
                            borderLeft: '3px solid #7c49f5', 
                            paddingLeft: '15px',
                            marginLeft: '10px'
                          }}>
                            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#7c49f5' }}>
                              💬 Commentaires ({comments.length})
                            </h4>
                            {comments.length === 0 ? (
                              <p style={{ color: '#666', fontStyle: 'italic' }}>
                                Aucun commentaire pour cette idée.
                              </p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {comments.map((comment, idx) => (
                                  <div 
                                    key={idx} 
                                    style={{ 
                                      padding: '12px',
                                      background: 'rgba(255, 255, 255, 0.5)',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(124, 73, 245, 0.2)'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                      {comment.user?.profilePhoto ? (
                                        <img 
                                          src={comment.user.profilePhoto} 
                                          alt={comment.user.alias || comment.user.name}
                                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div style={{ 
                                          width: '28px', 
                                          height: '28px', 
                                          borderRadius: '50%', 
                                          background: 'linear-gradient(135deg, #7c49f5, #00d9ff)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          fontWeight: 'bold',
                                          fontSize: '0.75rem'
                                        }}>
                                          {(comment.user?.name || comment.user?.alias || 'U').charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <strong style={{ fontSize: '0.9rem' }}>
                                          {comment.user?.alias || comment.user?.name || 'Unknown'}
                                        </strong>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                          {formatDate(comment.createdAt)}
                                        </div>
                                      </div>
                                    </div>
                                    <p style={{ 
                                      margin: 0, 
                                      color: '#333',
                                      fontSize: '0.9rem',
                                      lineHeight: '1.5',
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-word'
                                    }}>
                                      {comment.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Édition */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Modifier l'idée</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="text">Texte de l'idée</label>
                <textarea
                  id="text"
                  value={editData.text}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="6"
                  maxLength="2000"
                />
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                  {editData.text.length} / 2000 caractères
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirmer la suppression</h3>
            </div>

            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette idée ?</p>
              <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '10px' }}>
                ⚠️ Cette action est irréversible.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteIdea(confirmDelete)}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerateIdeas;

