import React, { useMemo, useState } from "react";

const REQUIRED_DOCS = [
  {
    name: "Aadhaar Card",
    explanation: "Required for identity validation under KYC rules.",
    priority: "critical"
  },
  {
    name: "PAN Card",
    explanation: "Required for tax compliance and identity linkage.",
    priority: "critical"
  },
  {
    name: "Address Proof",
    explanation: "Required to verify current residential address.",
    priority: "critical"
  },
  {
    name: "Income Certificate",
    explanation: "Needed to validate income bracket for subsidy and benefits.",
    priority: "critical"
  },
  {
    name: "Educational Qualification",
    explanation: "Used to confirm education-based scheme eligibility.",
    priority: "moderate"
  },
  {
    name: "Bank Account Statement",
    explanation: "Verifies active account for direct benefit transfer.",
    priority: "low"
  }
];

function normalize(value) {
  return value.trim().toLowerCase();
}

function prettyPriority(priority) {
  if (priority === "critical") return "Critical";
  if (priority === "moderate") return "Moderate";
  return "Low";
}

export default function RejectionEnginePage({ onBack }) {
  const [documents, setDocuments] = useState({});
  const [docNameInput, setDocNameInput] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [analysisRun, setAnalysisRun] = useState(false);

  const baseFetchedDocs = [
    { name: "Aadhaar Card", found: true, source: "digilocker" },
    { name: "PAN Card", found: true, source: "digilocker" },
    { name: "Driving License", found: false, source: "digilocker" }
  ];

  const docList = Object.values(documents);

  const riskScore = useMemo(() => {
    let points = 0;

    REQUIRED_DOCS.forEach((req) => {
      const foundDoc = docList.find(
        (doc) => normalize(doc.name || "") === normalize(req.name) && doc.found === true
      );
      if (!foundDoc) {
        if (req.priority === "critical") points += 3;
        else if (req.priority === "moderate") points += 2;
        else points += 1;
      }
    });

    if (points >= 9) {
      return {
        label: "High",
        helper: "Several critical documents are unresolved.",
        className: "risk high"
      };
    }

    if (points >= 4) {
      return {
        label: "Medium",
        helper: "A few key checks are still pending.",
        className: "risk medium"
      };
    }

    return {
      label: "Low",
      helper: "Most required checks are satisfied.",
      className: "risk low"
    };
  }, [docList]);

  const analysisResults = useMemo(() => {
    const groupedResults = [];

    REQUIRED_DOCS.forEach((required) => {
      const foundDoc = docList.find(
        (doc) => normalize(doc.name || "") === normalize(required.name) && doc.found === true
      );

      if (!foundDoc) {
        groupedResults.push({
          issueTitle: `${required.name} document is missing`,
          priority: required.priority,
          explanation: required.explanation,
          suggestion: `Upload ${required.name} or fetch again from DigiLocker.`
        });
      }
    });

    docList.forEach((doc) => {
      if (doc.found === false) {
        const matchedRequired = REQUIRED_DOCS.find(
          (req) => normalize(req.name) === normalize(doc.name || "")
        );

        groupedResults.push({
          issueTitle: `${doc.name} not found in DigiLocker`,
          priority: matchedRequired?.priority || "moderate",
          explanation:
            matchedRequired?.explanation ||
            "This document could not be verified from DigiLocker records.",
          suggestion: `Upload ${doc.name} manually to continue verification.`
        });
      }
    });

    return groupedResults;
  }, [docList]);

  const uploadedDocs = docList.filter((doc) => doc.source === "upload");

  const updateDocument = (documentName, updates) => {
    const key = normalize(documentName);
    const existingDoc = documents[key] || { name: documentName };

    setDocuments({
      ...documents,
      [key]: {
        ...existingDoc,
        ...updates,
        name: updates.name || existingDoc.name || documentName
      }
    });
  };

  const handleFetchDocuments = () => {
    const fetchedPayload = { ...documents };
    baseFetchedDocs.forEach((doc) => {
      const key = normalize(doc.name);
      const existingDoc = fetchedPayload[key] || {};
      fetchedPayload[key] = {
        ...existingDoc,
        ...doc
      };
    });

    setDocuments(fetchedPayload);
    setUploadMessage("DigiLocker documents fetched successfully.");
  };

  const handleFetchSingle = (documentName) => {
    updateDocument(documentName, {
      name: documentName,
      found: true,
      source: "digilocker",
      status: "fetched"
    });
    setUploadMessage(`${documentName} fetched from DigiLocker.`);
  };

  const handleUploadNow = (documentName) => {
    updateDocument(documentName, {
      name: documentName,
      found: true,
      source: "upload",
      fileName: `${documentName}.pdf`,
      status: "uploaded"
    });
    setUploadMessage(`${documentName} marked as uploaded.`);
  };

  const handleFileSelection = (event) => {
    const selectedFile = event.target.files?.[0];
    setSelectedFileName(selectedFile?.name || "");
  };

  const handleUpload = () => {
    if (!docNameInput.trim() || !selectedFileName) {
      setUploadMessage("Enter a document name and choose a file first.");
      return;
    }

    updateDocument(docNameInput.trim(), {
      name: docNameInput.trim(),
      found: true,
      source: "upload",
      fileName: selectedFileName,
      status: "uploaded"
    });

    setUploadMessage(`${docNameInput.trim()} uploaded successfully.`);
    setDocNameInput("");
    setSelectedFileName("");
  };

  return (
    <div className="form-section">
      <div className="rie-header rie-card">
        <div>
          <h2>Rejection Intelligence Engine</h2>
          <p className="subtitle">Analyze and resolve document verification issues</p>
        </div>
        <div className={riskScore.className}>
          <span>Rejection Risk: {riskScore.label}</span>
          <small>{riskScore.helper}</small>
        </div>
      </div>

      <section className="rie-card">
        <div className="section-head">
          <h3>DigiLocker Integration</h3>
          <button className="submit-btn rie-inline-btn" type="button" onClick={handleFetchDocuments}>
            Fetch Documents
          </button>
        </div>

        <p className="connected">DigiLocker Connected</p>

        <div className="doc-list">
          {baseFetchedDocs.map((templateDoc) => {
            const key = normalize(templateDoc.name);
            const syncedDoc = documents[key] || templateDoc;
            const badgeClass = syncedDoc.found ? "badge fetched" : "badge pending";
            const badgeText = syncedDoc.found ? "Fetched" : "Pending";

            return (
              <div className="doc-row" key={templateDoc.name}>
                <div>
                  <strong>{templateDoc.name}</strong>
                </div>
                <span className={badgeClass}>{badgeText}</span>
                <div className="actions">
                  <button className="secondary-btn" type="button" onClick={() => handleFetchSingle(templateDoc.name)}>
                    Fetch Again
                  </button>
                  <button className="submit-btn rie-small-btn" type="button" onClick={() => handleUploadNow(templateDoc.name)}>
                    Upload Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rie-card">
        <h3>Upload Documents</h3>
        <div className="upload-grid">
          <input
            type="text"
            placeholder="e.g., Address Proof, Income Certificate"
            value={docNameInput}
            onChange={(event) => setDocNameInput(event.target.value)}
          />
          <input type="file" onChange={handleFileSelection} />
          <button className="submit-btn rie-inline-btn" type="button" onClick={handleUpload}>
            Upload
          </button>
        </div>

        {uploadMessage && <p className="upload-msg">{uploadMessage}</p>}

        <div className="uploaded-list">
          {uploadedDocs.length === 0 ? (
            <p>No uploaded documents yet.</p>
          ) : (
            uploadedDocs.map((doc) => (
              <div className="uploaded-item" key={`${doc.name}-${doc.fileName || "file"}`}>
                <span>{doc.name}</span>
                <span className="ok">Uploaded</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rie-card">
        <div className="section-head">
          <h3>Rejection Analysis</h3>
          <button className="submit-btn rie-inline-btn" type="button" onClick={() => setAnalysisRun(true)}>
            Check Rejection
          </button>
        </div>

        {analysisRun && (
          <div className="results-grid">
            {analysisResults.length === 0 ? (
              <div className="result-card resolved">
                <h4>All key documents are verified</h4>
                <p>Your profile is currently in a safe state for document review.</p>
              </div>
            ) : (
              analysisResults.map((result, index) => {
                const targetDoc = result.issueTitle
                  .replace(" document is missing", "")
                  .replace(" not found in DigiLocker", "");

                return (
                  <article className={`result-card ${result.priority}`} key={`${result.issueTitle}-${index}`}>
                    <div className="result-top">
                      <h4>{result.issueTitle}</h4>
                      <span className={`priority ${result.priority}`}>{prettyPriority(result.priority)}</span>
                    </div>
                    <p>{result.explanation}</p>
                    <div className="actions">
                      <button className="secondary-btn" type="button" onClick={() => handleFetchSingle(targetDoc)}>
                        Fetch from DigiLocker
                      </button>
                      <button className="submit-btn rie-small-btn" type="button" onClick={() => handleUploadNow(targetDoc)}>
                        Upload Now
                      </button>
                    </div>
                    <div className="fix">
                      <strong>Suggested Fix:</strong> {result.suggestion}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>

      <button type="button" className="back-btn" onClick={onBack}>
        Back to Home
      </button>
    </div>
  );
}
