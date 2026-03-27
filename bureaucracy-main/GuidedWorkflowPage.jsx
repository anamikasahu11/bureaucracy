import React, { useContext, useMemo, useState } from "react";
import { UserContext } from "./UserContext";

function isExpired(expiryDate) {
  return new Date(expiryDate) < new Date();
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

export default function GuidedWorkflowPage({ onBack }) {
  const { userData, setUserData } = useContext(UserContext);
  const [docName, setDocName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const totalDocs = userData.documents.length;
  const expiredDocs = useMemo(
    () => userData.documents.filter((doc) => isExpired(doc.expiryDate)).length,
    [userData.documents]
  );

  const handleAddDocument = () => {
    if (!docName.trim() || !expiryDate) {
      return;
    }

    const duplicate = userData.documents.some(
      (doc) => doc.name.trim().toLowerCase() === docName.trim().toLowerCase()
    );

    if (duplicate) {
      alert("Document with this name already exists.");
      return;
    }

    const newDoc = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: docName.trim(),
      expiryDate
    };

    setUserData({
      ...userData,
      documents: [...userData.documents, newDoc]
    });

    setDocName("");
    setExpiryDate("");
  };

  const handleDeleteDocument = (id) => {
    setUserData({
      ...userData,
      documents: userData.documents.filter((doc) => doc.id !== id)
    });
  };

  return (
    <div className="form-section">
      <h2>Guided Document Workflow</h2>
      <p className="subtitle">Upload essential documents and validate expiry status in one guided flow.</p>

      <div className="info-grid workflow-summary-grid">
        <div className="info-item">
          <span className="label">Total Documents</span>
          <span className="value">{totalDocs}</span>
        </div>
        <div className="info-item">
          <span className="label">Expired Documents</span>
          <span className={`value ${expiredDocs > 0 ? "risk-text" : "verified"}`}>{expiredDocs}</span>
        </div>
        <div className="info-item">
          <span className="label">Current Status</span>
          <span className="value">{expiredDocs > 0 ? "Action Needed" : "Healthy"}</span>
        </div>
      </div>

      <div className="mini-card">
        <h3>Add a Document</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Document Name</label>
            <input
              type="text"
              value={docName}
              onChange={(event) => setDocName(event.target.value)}
              placeholder="Document Name"
            />
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              placeholder="Expiry Date"
            />
          </div>
        </div>
        <button type="button" className="submit-btn" onClick={handleAddDocument}>
          Add Document
        </button>
      </div>

      <div className="mini-card">
        <h3>Document Validation</h3>
        {userData.documents.length === 0 ? (
          <p>Add documents to view status checks.</p>
        ) : (
          <ul className="validation-list">
            {userData.documents.map((doc) => {
              const expired = isExpired(doc.expiryDate);
              return (
                <li key={doc.id} className="validation-item">
                  <div>
                    <strong>{doc.name}</strong>
                    <p>Expires: {formatDate(doc.expiryDate)}</p>
                  </div>
                  <div className="validation-actions">
                    <span className={`status-pill ${expired ? "expired" : "valid"}`}>
                      {expired ? "Expired" : "Valid"}
                    </span>
                    <button type="button" className="secondary-btn" onClick={() => handleDeleteDocument(doc.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button type="button" className="back-btn" onClick={onBack}>
        Back to Home
      </button>
    </div>
  );
}
