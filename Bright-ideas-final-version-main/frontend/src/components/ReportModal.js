import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/reportModal.css';

const ReportModal = ({ isOpen, onClose, onReport, type = 'idea' }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predefinedReasons = [
    t('report.spam'),
    t('report.inappropriate'),
    t('report.hateSpeech'),
    t('report.harassment'),
    t('report.falseInfo'),
    t('report.other')
  ];

  const handleSubmit = async () => {
    setError('');
    
    const finalReason = selectedReason || reason.trim();
    
    if (!finalReason) {
      setError(t('report.reasonRequired'));
      return;
    }

    if (finalReason.length > 500) {
      setError(t('report.reasonTooLong'));
      return;
    }

    setLoading(true);
    try {
      await onReport(finalReason);
      setReason('');
      setSelectedReason('');
      onClose();
    } catch (err) {
      setError(err.message || t('report.errorReporting'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setSelectedReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {type === 'comment' ? t('report.reportComment') : t('report.reportIdea')}
          </h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="report-description">
            {t('report.description')}
          </p>

          <div className="report-reasons">
            <label className="form-label">{t('report.selectReason')}</label>
            <div className="reason-options">
              {predefinedReasons.map((predefinedReason, index) => (
                <button
                  key={index}
                  type="button"
                  className={`reason-option ${selectedReason === predefinedReason ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedReason(predefinedReason);
                    setReason('');
                  }}
                >
                  {predefinedReason}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('report.additionalDetails')}</label>
            <textarea
              className="form-input"
              rows="4"
              placeholder={t('report.detailsPlaceholder')}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setSelectedReason('');
              }}
              maxLength={500}
            />
            <div className="char-counter">
              {reason.length} / 500
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="modal-footer">
            <button 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={loading || (!reason.trim() && !selectedReason)}
            >
              {loading ? t('report.reporting') : t('report.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;

