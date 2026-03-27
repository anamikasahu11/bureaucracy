import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";

const DOCUMENT_LABELS = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  incomeCert: "Income Certificate",
  casteCert: "Caste Certificate",
  educationDocs: "Education Document",
  domicile: "Domicile Certificate",
  rationCard: "Ration Card",
  disabilityCert: "Disability Certificate"
};

export default function EligibilityPanel({
  userProfile,
  digiLockerDocuments,
  missingDocuments,
  onFetchDocuments,
  onUploadToDigiLocker,
  onProceed,
  onBack
}) {
  const { updateDigiLockerDocuments } = useContext(UserContext);
  const [manualEntries, setManualEntries] = useState({});
  const [showManualInput, setShowManualInput] = useState({});
  const [isReady, setIsReady] = useState(false);

  const requiredDocs = ["aadhaar", "pan", "incomeCert", "casteCert", "educationDocs"];
  if (userProfile?.disability === "Yes") requiredDocs.push("disabilityCert");

  const presentDocs = Object.entries(digiLockerDocuments || {}).filter(([, doc]) => doc?.found);
  const presentDocKeys = presentDocs.map(([key]) => key);

  const missing = requiredDocs.filter((docKey) => !presentDocKeys.includes(docKey));

  const availableDocsList = presentDocs.map(([key, value]) => DOCUMENT_LABELS[key] || value.name || key);

  const verifyReady = () => {
    const manualKeys = Object.keys(manualEntries);
    const allFulfilled = requiredDocs.every((docKey) =>
      presentDocKeys.includes(docKey) || manualKeys.includes(docKey)
    );
    setIsReady(allFulfilled);
  };

  useEffect(() => {
    verifyReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digiLockerDocuments, manualEntries]);

  const startManualEntry = (docKey) => {
    setShowManualInput((prev) => ({ ...prev, [docKey]: true }));
  };

  const setManualValue = (docKey, value) => {
    setManualEntries((prev) => ({ ...prev, [docKey]: { value, label: DOCUMENT_LABELS[docKey], data: { verificationStatus: "manual", value } } }));
  };

  const onContinue = () => {
    if (!isReady) {
      alert("Please provide or upload all required documents before continue.");
      return;
    }

    // Save any manual entries directly to lockerdocs in context maybe
    const mergedDocs = { ...digiLockerDocuments };
    Object.keys(manualEntries).forEach((docKey) => {
      mergedDocs[docKey] = {
        name: DOCUMENT_LABELS[docKey] || docKey,
        found: true,
        extractedData: manualEntries[docKey].data
      };
    });
    updateDigiLockerDocuments(mergedDocs);

    if (onProceed) {
      onProceed(manualEntries);
    }
  };

  return (
    <div className="form-section">
      <h2>📋 Eligibility Review</h2>
      <p>Review profile and document status before starting the eligibility analysis.</p>

      <div className="eligibility-grid">
        <div className="card">
          <h3>🧩 Profile Summary</h3>
          <ul>
            <li>Name: {userProfile?.name}</li>
            <li>Mobile: {userProfile?.mobile}</li>
            <li>Age: {userProfile?.age} years</li>
            <li>State: {userProfile?.state}</li>
            <li>District: {userProfile?.district}</li>
            <li>Category: {userProfile?.category || "General"}</li>
            <li>Gender: {userProfile?.gender || "N/A"}</li>
            <li>Disability: {userProfile?.disability || "No"}</li>
          </ul>
        </div>

        <div className="card">
          <h3>📂 Document Manager</h3>

          <div className="sub-card">
            <h4>✅ Documents Available in DigiLocker</h4>
            {availableDocsList.length ? (
              <ul>
                {availableDocsList.map((doc, idx) => (
                  <li key={idx}>✔ {doc}</li>
                ))}
              </ul>
            ) : (
              <p>No documents fetched yet.</p>
            )}
          </div>

          <div className="sub-card">
            <h4>❌ Missing Documents</h4>
            {missing.length ? (
              missing.map((docKey) => (
                <div key={docKey} className="warning-doc">
                  <span>{DOCUMENT_LABELS[docKey] || docKey}</span>
                  <div className="action-group">
                    <button className="small-btn" onClick={() => onUploadToDigiLocker(docKey)}>
                      Upload to DigiLocker
                    </button>
                    <button className="small-btn" onClick={() => startManualEntry(docKey)}>
                      Enter Data Manually
                    </button>
                  </div>

                  {showManualInput[docKey] && (
                    <div className="manual-entry">
                      <label>Provided value</label>
                      <input
                        type="text"
                        placeholder={`Enter ${DOCUMENT_LABELS[docKey] || docKey}`}
                        onChange={(e) => setManualValue(docKey, e.target.value)}
                        value={(manualEntries[docKey] && manualEntries[docKey].value) || ""}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>All required documents are present.</p>
            )}
          </div>

          <button className="continue-btn" onClick={onContinue} disabled={!isReady || missing.length > 0 && !isReady}>
            Continue →
          </button>
        </div>
      </div>

      <button className="back-btn" onClick={onBack}>← Back</button>
    </div>
  );
}
