import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadStory } from '../utils/api';
import { StoriesContext } from '../context/StoriesContext';
import { FaCloudUploadAlt, FaFilePdf } from 'react-icons/fa';

const UploadStory = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshStories } = useContext(StoriesContext);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setMessage('');
    } else {
      setFile(null);
      setError('Vui lòng chọn file PDF.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn một file để tải lên.');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      await uploadStory(file);
      setMessage('Tải lên thành công!');
      
      // Refresh the stories list
      await refreshStories();
      
      setFile(null);
      // Reset file input
      document.getElementById('file-upload').value = '';
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi tải lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="content-container" style={{ maxWidth: '600px', width: '100%', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>Đăng Truyện Mới</h2>
        
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div 
            className="upload-area"
            style={{ 
              border: '2px dashed var(--border-color)', 
              borderRadius: '8px', 
              padding: '3rem', 
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'var(--bg-secondary)'
            }}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input 
              type="file" 
              id="file-upload" 
              accept=".pdf" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <FaFilePdf size={48} color="#e74c3c" />
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{file.name}</span>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Nhấn để thay đổi file</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <FaCloudUploadAlt size={48} color="var(--primary-color)" />
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Nhấn để chọn file PDF</span>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>hoặc kéo thả file vào đây</span>
              </div>
            )}
          </div>

          {error && <div style={{ color: '#e74c3c', textAlign: 'center', padding: '0.5rem', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '4px' }}>{error}</div>}
          {message && <div style={{ color: '#2ecc71', textAlign: 'center', padding: '0.5rem', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '4px' }}>{message}</div>}

          <button 
            type="submit" 
            disabled={!file || uploading}
            className="btn-primary"
            style={{ 
              padding: '1rem', 
              fontSize: '1.1rem', 
              opacity: (!file || uploading) ? 0.7 : 1,
              cursor: (!file || uploading) ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? 'Đang tải lên...' : 'Đăng Truyện'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadStory;

