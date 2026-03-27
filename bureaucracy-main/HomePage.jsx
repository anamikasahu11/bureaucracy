import React, { useContext } from "react";
import { UserContext } from "./UserContext";

export default function HomePage({ onNavigate, onLogout }) {
  const { userProfile } = useContext(UserContext);

  return (
    <div className="form-section">
      <h2>Welcome, {userProfile?.name}! 👋</h2>
      <p className="subtitle">Select a service to check your eligibility for government schemes</p>

      <div className="button-grid">
<button className="nav-button primary" onClick={() => onNavigate("eligibility")}> 
          <span className="button-emoji">🔐</span>
          <span className="button-title">Start Eligibility Check</span>
          <span className="button-desc">Verify documents & check schemes</span>
        </button>

        <button className="nav-button" onClick={() => onNavigate("locker")}>
          <span className="button-emoji">📂</span>
          <span className="button-title">Locker Panel</span>
          <span className="button-desc">Upload & manage documents</span>
        </button>

        <button className="nav-button" onClick={() => onNavigate("guided_workflow")}>
          <span className="button-emoji">📋</span>
          <span className="button-title">Guided Workflow</span>
          <span className="button-desc">Step-by-step application guide</span>
        </button>

        <button className="nav-button" onClick={() => onNavigate("rejection")}>
          <span className="button-emoji">⚠️</span>
          <span className="button-title">Rejection Analysis</span>
          <span className="button-desc">Review risks & missing documents</span>
        </button>
      </div>

      <div className="user-info-card">
        <h3>📋 Your Profile</h3>
        <ul>
          <li><strong>Name:</strong> {userProfile?.name}</li>
          <li><strong>Mobile:</strong> {userProfile?.mobile}</li>
          <li><strong>Email:</strong> {userProfile?.email}</li>
          <li><strong>Age:</strong> {userProfile?.age} years</li>
          <li><strong>State:</strong> {userProfile?.state}</li>
          <li><strong>District:</strong> {userProfile?.district}</li>
          <li><strong>Category:</strong> {userProfile?.category || "General"}</li>
          {userProfile?.gender && <li><strong>Gender:</strong> {userProfile.gender}</li>}
          {userProfile?.disability && <li><strong>Disability:</strong> {userProfile.disability}</li>}
        </ul>
      </div>

      <div className="info-section">
        <h3>💡 How It Works</h3>
        <div className="steps-list">
          <div className="step-item">
            <span className="step-number">1</span>
            <div className="step-content">
              <h4>Connect DigiLocker</h4>
              <p>Your documents are automatically fetched and verified</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">2</span>
            <div className="step-content">
              <h4>Answer Questions</h4>
              <p>Provide additional information required for schemes</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">3</span>
            <div className="step-content">
              <h4>See Results</h4>
              <p>Get detailed eligibility for all available schemes</p>
            </div>
          </div>
        </div>
      </div>

      {onLogout && <button onClick={onLogout} className="logout-btn">Logout</button>}
    </div>
  );
}
