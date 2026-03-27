import React, { useState } from "react";

export default function DynamicQuestionFlow({ extractedData, verificationIssues, onDataUpdate }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    income: extractedData?.income || "",
    employmentStatus: extractedData?.employmentStatus || "Student",
    occupationType: extractedData?.occupationType || "",
    businessType: extractedData?.businessType || "",
    familyIncome: extractedData?.familyIncome || "",
    landOwnership: extractedData?.landOwnership || "No",
    businessSize: extractedData?.businessSize || ""
  });

  const handleAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
      onDataUpdate(answers);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const validateStep = () => {
    if (currentStep === 1 && !answers.income) {
      alert("Please enter annual income");
      return false;
    }
    if (currentStep === 2 && !answers.employmentStatus) {
      alert("Please select employment status");
      return false;
    }
    if (currentStep === 2 && answers.employmentStatus === "Self-employed" && !answers.occupationType) {
      alert("Please specify occupation type");
      return false;
    }
    return true;
  };

  return (
    <div className="form-section">
      <h2>📋 Information Details</h2>
      <p>Answer the following questions to determine your eligibility. Questions are based on your verified documents.</p>

      <div className="progress-indicator">
        <div className="steps">
          {[1, 2, 3].map(step => (
            <div key={step} className={`step ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}>
              {step}
            </div>
          ))}
        </div>
        <p className="step-label">Step {currentStep} of 3</p>
      </div>

      {/* Step 1: Financial Information */}
      {currentStep === 1 && (
        <div className="question-section">
          <h3>💰 Financial Information</h3>

          <div className="form-group">
            <label>Annual Income (₹) *</label>
            <div className="input-with-info">
              <input
                type="number"
                value={answers.income}
                onChange={(e) => handleAnswer("income", e.target.value)}
                placeholder="e.g., 300000"
              />
              <span className="info-icon">📌 Used for income-based schemes</span>
            </div>
          </div>

          {!extractedData?.incomeCert?.found && (
            <div className="warning-box">
              <p>⚠️ Income Certificate not found in DigiLocker. Please enter your annual income manually.</p>
              <p>If you have an Income Certificate, you can upload it later in the Locker Panel.</p>
            </div>
          )}

          <div className="form-group">
            <label>Family Annual Income (₹)</label>
            <input
              type="number"
              value={answers.familyIncome}
              onChange={(e) => handleAnswer("familyIncome", e.target.value)}
              placeholder="e.g., 500000 (Optional)"
            />
          </div>
        </div>
      )}

      {/* Step 2: Employment Information */}
      {currentStep === 2 && (
        <div className="question-section">
          <h3>💼 Employment Information</h3>

          <div className="form-group">
            <label>Employment Status *</label>
            <select
              value={answers.employmentStatus}
              onChange={(e) => handleAnswer("employmentStatus", e.target.value)}
            >
              <option value="Student">Student</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Employed">Employed</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Farmer">Farmer</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          {answers.employmentStatus === "Self-employed" && (
            <div className="form-group">
              <label>Occupation Type *</label>
              <input
                value={answers.occupationType}
                onChange={(e) => handleAnswer("occupationType", e.target.value)}
                placeholder="e.g., Freelancer, Consultant, Shopkeeper"
                required
              />
            </div>
          )}

          {answers.employmentStatus === "Self-employed" && (
            <div className="form-group">
              <label>Business Type</label>
              <input
                value={answers.businessType}
                onChange={(e) => handleAnswer("businessType", e.target.value)}
                placeholder="e.g., Service, Manufacturing, Retail"
              />
            </div>
          )}

          {answers.employmentStatus === "Farmer" && (
            <div className="form-group">
              <label>Land Ownership Status</label>
              <select
                value={answers.landOwnership}
                onChange={(e) => handleAnswer("landOwnership", e.target.value)}
              >
                <option value="No">No Land</option>
                <option value="1-1 Acre">1-1 Acre</option>
                <option value="1-2 Acres">1-2 Acres</option>
                <option value="2+ Acres">2+ Acres</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Additional Details */}
      {currentStep === 3 && (
        <div className="question-section">
          <h3>✅ Review Your Information</h3>

          <div className="summary-box">
            <h4>Your Verified Data</h4>
            <ul>
              <li><strong>Name:</strong> {extractedData?.name} ✔</li>
              <li><strong>Age:</strong> {extractedData?.age} ✔</li>
              <li><strong>Category:</strong> {extractedData?.category || "General"} {extractedData?.categoryVerified ? "✔" : ""}</li>
              <li><strong>Education:</strong> {extractedData?.qualification || "Not Verified"}</li>
              <li><strong>State:</strong> {extractedData?.state || "Not Verified"}</li>
            </ul>
          </div>

          <div className="summary-box">
            <h4>Your Answers</h4>
            <ul>
              <li><strong>Annual Income:</strong> ₹{answers.income}</li>
              <li><strong>Employment Status:</strong> {answers.employmentStatus}</li>
              {answers.occupationType && <li><strong>Occupation:</strong> {answers.occupationType}</li>}
              {answers.familyIncome && <li><strong>Family Income:</strong> ₹{answers.familyIncome}</li>}
            </ul>
          </div>

          {verificationIssues?.length > 0 && (
            <div className="issues-box">
              <h4>📌 Verification Notes</h4>
              {verificationIssues.map((issue, idx) => (
                <div key={idx} className={`issue-item issue-${issue.severity}`}>
                  {issue.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="button-group">
        {currentStep > 1 && (
          <button onClick={handlePrevious} className="secondary-btn">← Previous</button>
        )}
        {currentStep < 3 && (
          <button onClick={handleNext} className="submit-btn">Next →</button>
        )}
        {currentStep === 3 && (
          <button onClick={() => onDataUpdate(answers)} className="submit-btn">Check Eligibility →</button>
        )}
      </div>
    </div>
  );
}
