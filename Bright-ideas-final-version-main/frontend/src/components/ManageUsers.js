import React, { useState, useEffect } from 'react';
import '../styles/manageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [editData, setEditData] = useState({
    name: '',
    alias: '',
    email: '',
    dateOfBirth: '',
    address: '',
  });

  // Charger tous les utilisateurs au montage
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors du chargement des utilisateurs');
      }

      setUsers(data.users || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setEditData({
      name: user.name || '',
      alias: user.alias || '',
      email: user.email || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      address: user.address || '',
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.id]: e.target.value });
  };

  const handleSaveEdit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!editData.name || !editData.alias || !editData.email || !editData.dateOfBirth || !editData.address) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      setError('Format d\'email invalide');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }

      setSuccess('Utilisateur mis à jour avec succès !');
      setShowModal(false);
      setEditingId(null);

      // Rafraîchir la liste
      setTimeout(() => {
        fetchUsers();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteUser = async (userId) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      setSuccess('Utilisateur supprimé avec succès !');
      setConfirmDelete(null);

      // Rafraîchir la liste
      setTimeout(() => {
        fetchUsers();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="manage-users-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <div className="manage-users-header">
        <div className="header-content">
          <h2>👥 Gestion des Utilisateurs</h2>
          <div className="contact-count">
            <span className="count-number">{filteredUsers.length}</span>
            <span className="count-text">Utilisateur{filteredUsers.length !== 1 ? 's' : ''}</span>
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
          placeholder="🔍 Rechercher par nom, alias ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nom</th>
                <th>Alias</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-avatar">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} />
                      ) : (
                        <div className="avatar-initial">
                          {(user.name || user.alias || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.alias}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setConfirmDelete(user._id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Édition */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier l'utilisateur</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Nom complet</label>
                <input
                  id="name"
                  type="text"
                  value={editData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="alias">Alias</label>
                <input
                  id="alias"
                  type="text"
                  value={editData.alias}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date de naissance</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={editData.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse</label>
                <textarea
                  id="address"
                  value={editData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-input"
                ></textarea>
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
              <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
              <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '10px' }}>
                ⚠️ Cette action supprimera également toutes les idées de cet utilisateur. Cette action est irréversible.
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
                onClick={() => handleDeleteUser(confirmDelete)}
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

export default ManageUsers;