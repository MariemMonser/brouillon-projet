import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/postIdea.css';

const PostIdea = ({ user, onIdeaPosted }) => {
  const { t } = useTranslation();
  const [ideaText, setIdeaText] = useState('');
  const [ideaImage, setIdeaImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userInitial = (user?.name || user?.alias || 'U').charAt(0).toUpperCase();
  const profilePhotoSrc = user?.profilePhoto || null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('home.imageSizeError'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdeaImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setIdeaImage(null);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!ideaText.trim()) {
      setError(t('home.enterIdea'));
      return;
    }

    if (ideaText.length < 10) {
      setError(t('home.ideaMinChars'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: ideaText,
          image: ideaImage
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t('home.errorPublishing'));
      }

      setSuccess(t('home.ideaPublished'));
      setIdeaText('');
      setIdeaImage(null);
      setIsExpanded(false);

      // Notify parent component to refresh ideas
      if (onIdeaPosted) {
        setTimeout(() => {
          onIdeaPosted();
          setSuccess('');
        }, 2000);
      } else {
        setTimeout(() => {
          setSuccess('');
          window.location.reload();
        }, 2000);
      }

    } catch (err) {
      setError(err.message || t('home.errorPublishing'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-idea-container">
      {/* Messages d'alerte */}
      {error && (
        <div className="post-alert post-alert-error">
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div className="post-alert post-alert-success">
          ✓ {success}
        </div>
      )}

      <div className="post-idea-card">
        {/* Header avec avatar */}
        <div className="post-idea-header">
          <div className="post-avatar">
            {profilePhotoSrc ? (
              <img src={profilePhotoSrc} alt="profile" />
            ) : (
              <div className="post-avatar-initial">{userInitial}</div>
            )}
          </div>
          <div className="post-user-info">
            <span className="post-username">{user?.alias || user?.name}</span>
            <span className="post-prompt">{t('home.whatsYourIdea')}</span>
          </div>
        </div>

        {/* Zone de texte */}
        <div className={`post-textarea-wrapper ${isExpanded ? 'expanded' : ''}`}>
          <textarea
            className="post-textarea"
            placeholder={t('home.shareIdea')}
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            rows={isExpanded ? 6 : 3}
            maxLength={2000}
          />
          
          {ideaText.length > 0 && (
            <div className="char-counter">
              {ideaText.length} / 2000
            </div>
          )}
        </div>

        {/* Preview de l'image */}
        {ideaImage && (
          <div className="image-preview-container">
            <img src={ideaImage} alt="Preview" className="image-preview" />
            <button 
              className="remove-image-btn"
              onClick={handleRemoveImage}
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        {/* Actions bar */}
        {isExpanded && (
          <div className="post-actions-bar">
            <div className="post-actions-left">
              <label className="action-btn" title="Ajouter une image">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>{t('home.photo')}</span>
              </label>

              <button className="action-btn" title={t('home.tag')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="9" x2="20" y2="9"></line>
                  <line x1="4" y1="15" x2="20" y2="15"></line>
                  <line x1="10" y1="3" x2="8" y2="21"></line>
                  <line x1="16" y1="3" x2="14" y2="21"></line>
                </svg>
                <span>{t('home.tag')}</span>
              </button>

              <button className="action-btn" title={t('home.category')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                <span>{t('home.category')}</span>
              </button>
            </div>

            <div className="post-actions-right">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsExpanded(false);
                  setIdeaText('');
                  setIdeaImage(null);
                }}
                disabled={loading}
              >
                {t('home.cancel')}
              </button>
              <button 
                className="publish-btn"
                onClick={handleSubmit}
                disabled={loading || !ideaText.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    {t('home.publishing')}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    {t('home.publish')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostIdea;