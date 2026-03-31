import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Trash2, LogOut } from 'lucide-react';
import robotIcon from '../assets/robot.png';

const UploadPanel = ({ onUpload, isUploading, files, onClear, onExit }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  }, [onUpload]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
        <img src={robotIcon} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '10px' }} />
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>ChatHub</h1>
      </div>
      
      <div style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px'}}>
        Knowledge Base
      </div>
      
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <UploadCloud className="upload-icon" />
        <p className="upload-text">Drag & drop files here</p>
        <p className="upload-text" style={{fontSize: '0.8rem', marginTop: "5px"}}>PDF, PPTX, TXT</p>
        <input 
          id="file-upload" 
          type="file" 
          multiple 
          accept=".pdf,.ppt,.pptx,.txt" 
          onChange={handleChange} 
          style={{ display: 'none' }} 
        />
      </div>
      
      {isUploading && (
        <button className="btn" disabled>
          Processing...
        </button>
      )}

      {!isUploading && (
        <button className="btn" onClick={() => document.getElementById('file-upload').click()}>
          Upload Documents
        </button>
      )}
      
      <div style={{ marginTop: '30px', marginBottom: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Indexed Documents ({files.length})
      </div>
      
      <div className="file-list">
        {files.length === 0 ? (
          <p style={{fontSize: '0.8rem', color: '#666', fontStyle: 'italic'}}>No files uploaded yet.</p>
        ) : (
          files.map((file, idx) => (
            <div key={idx} className="file-item">
              <FileText size={16} />
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={file}>{file}</span>
            </div>
          ))
        )}
      </div>

      {files.length > 0 && (
        <button className="btn btn-danger" onClick={onClear} style={{marginBottom: '20px'}}>
          <Trash2 size={16} /> Clear Index
        </button>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
        <button 
          className="btn" 
          onClick={onExit}
          style={{ 
            background: 'transparent', 
            color: '#ef4444', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: 'none'
          }}
        >
          <LogOut size={18} /> Exit Chat
        </button>
      </div>
    </div>
  );
};

export default UploadPanel;
