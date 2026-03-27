import { useMemo, useState } from "react";

const REQUIRED_DOCS = [
  {
    name: "Aadhaar Card",
    explanation: "Required for identity validation under KYC rules.",
    priority: "critical",
  },
  {
    name: "PAN Card",
    explanation: "Required for tax compliance and identity linkage.",
    priority: "critical",
  },
  {
    name: "Address Proof",
    explanation: "Required to verify current residential address.",
    priority: "critical",
  },
  {
    name: "Income Certificate",
    explanation:
      "Needed to validate income bracket for subsidy and benefits.",
    priority: "critical",
  },
  {
    name: "Educational Qualification",
    explanation:
      "Used to confirm education-based scheme eligibility.",
    priority: "moderate",
  },
  {
    name: "Bank Account Statement",
    explanation:
      "Recent statement verifies active account for direct benefit transfer.",
    priority: "low",
  },
];

function Rejection({ documents, setDocuments }) {
  const [docNameInput, setDocNameInput] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [analysisRun, setAnalysisRun] = useState(false);

  const baseFetchedDocs = [
    { name: "Aadhaar Card", found: true, source: "digilocker" },
    { name: "PAN Card", found: true, source: "digilocker" },
    { name: "Driving License", found: false, source: "digilocker" },
  ];

  const docMap = documents || {};
  const docList = Object.values(docMap);

  const normalize = (value) => value.trim().toLowerCase();

  const prettyPriority = (priority) => {
    if (priority === "critical") return "Critical";
    if (priority === "moderate") return "Moderate";
    return "Low";
  };

  const riskScore = useMemo(() => {
    let points = 0;

    REQUIRED_DOCS.forEach((req) => {
      const foundDoc = docList.find(
        (doc) =>
          normalize(doc.name || "") === normalize(req.name) && doc.found === true
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
        className: "risk high",
      };
    }

    if (points >= 4) {
      return {
        label: "Medium",
        helper: "A few key checks are still pending.",
        className: "risk medium",
      };
    }

    return {
      label: "Low",
      helper: "Most required checks are satisfied.",
      className: "risk low",
    };
  }, [docList]);

  const analysisResults = useMemo(() => {
    const groupedResults = [];

    REQUIRED_DOCS.forEach((required) => {
      const foundDoc = docList.find(
        (doc) =>
          normalize(doc.name || "") === normalize(required.name) && doc.found === true
      );

      if (!foundDoc) {
        groupedResults.push({
          issueTitle: `${required.name} document is missing`,
          priority: required.priority,
          explanation: required.explanation,
          suggestion: `Upload ${required.name} or fetch again from DigiLocker.`,
          type: "issue",
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
          suggestion: `Upload ${doc.name} manually to continue verification.`,
          type: "issue",
        });
      }
    });

    return groupedResults;
  }, [docList]);

  const uploadedDocs = docList.filter((doc) => doc.source === "upload");

  const updateDocument = (documentName, updates) => {
    const key = normalize(documentName);
    const existingDoc = docMap[key] || { name: documentName };

    setDocuments({
      ...docMap,
      [key]: {
        ...existingDoc,
        ...updates,
        name: updates.name || existingDoc.name || documentName,
      },
    });
  };

  const handleFetchDocuments = () => {
    const fetchedPayload = { ...docMap };

    baseFetchedDocs.forEach((doc) => {
      const key = normalize(doc.name);
      const existingDoc = fetchedPayload[key] || {};

      fetchedPayload[key] = {
        ...existingDoc,
        ...doc,
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
      status: "fetched",
    });
    setUploadMessage(`${documentName} fetched from DigiLocker.`);
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
      status: "uploaded",
    });

    setUploadMessage(`${docNameInput.trim()} uploaded successfully.`);
    setDocNameInput("");
    setSelectedFileName("");
  };

  const handleUploadNow = (documentName) => {
    updateDocument(documentName, {
      name: documentName,
      found: true,
      source: "upload",
      fileName: `${documentName}.pdf`,
      status: "uploaded",
    });
    setUploadMessage(`${documentName} marked as uploaded.`);
  };

  const getStatusClass = (doc) => {
    if (doc.found) return "badge fetched";
    return "badge pending";
  };

  const getStatusText = (doc) => {
    if (doc.found) return "Fetched";
    return "Pending";
  };

  return (
    <div className="rie-page">
      <div className="rie-shell">
        <header className="rie-header card">
          <div>
            <h1>Rejection Intelligence Engine</h1>
            <p>Analyze and resolve document verification issues</p>
          </div>
          <div className={riskScore.className}>
            <span>Rejection Risk: {riskScore.label}</span>
            <small>{riskScore.helper}</small>
          </div>
        </header>

        <section className="card">
          <div className="section-head">
            <h2>DigiLocker Integration</h2>
            <button className="btn primary" type="button" onClick={handleFetchDocuments}>
              Fetch Documents
            </button>
          </div>

          <p className="connected">DigiLocker Connected</p>

          <div className="doc-list">
            {baseFetchedDocs.map((templateDoc) => {
              const key = normalize(templateDoc.name);
              const syncedDoc = docMap[key] || templateDoc;

              return (
                <div className="doc-row" key={templateDoc.name}>
                  <div>
                    <strong>{templateDoc.name}</strong>
                  </div>
                  <span className={getStatusClass(syncedDoc)}>{getStatusText(syncedDoc)}</span>
                  <div className="actions">
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => handleFetchSingle(templateDoc.name)}
                    >
                      Fetch Again
                    </button>
                    <button
                      className="btn success"
                      type="button"
                      onClick={() => handleUploadNow(templateDoc.name)}
                    >
                      Upload Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h2>Upload Documents</h2>
          <div className="upload-grid">
            <input
              type="text"
              placeholder="e.g., Address Proof, Income Certificate"
              value={docNameInput}
              onChange={(event) => setDocNameInput(event.target.value)}
            />
            <input type="file" onChange={handleFileSelection} />
            <button className="btn success" type="button" onClick={handleUpload}>
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

        <section className="card analysis">
          <div className="section-head">
            <h2>Rejection Analysis</h2>
            <button className="btn primary" type="button" onClick={() => setAnalysisRun(true)}>
              Check Rejection
            </button>
          </div>

          {analysisRun && (
            <div className="results-grid">
              {analysisResults.length === 0 ? (
                <div className="result-card resolved">
                  <h3>All key documents are verified</h3>
                  <p>Your profile is currently in a safe state for document review.</p>
                </div>
              ) : (
                analysisResults.map((result, index) => (
                  <article className={`result-card ${result.priority}`} key={`${result.issueTitle}-${index}`}>
                    <div className="result-top">
                      <h3>{result.issueTitle}</h3>
                      <span className={`priority ${result.priority}`}>
                        {prettyPriority(result.priority)}
                      </span>
                    </div>
                    <p>{result.explanation}</p>
                    <div className="actions">
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={() => handleFetchSingle(result.issueTitle.replace(" document is missing", "").replace(" not found in DigiLocker", ""))}
                      >
                        Fetch from DigiLocker
                      </button>
                      <button
                        className="btn success"
                        type="button"
                        onClick={() => handleUploadNow(result.issueTitle.replace(" document is missing", "").replace(" not found in DigiLocker", ""))}
                      >
                        Upload Now
                      </button>
                    </div>
                    <div className="fix">
                      <strong>Suggested Fix:</strong> {result.suggestion}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .rie-page {
          min-height: 100vh;
          padding: 24px 16px 40px;
          background: radial-gradient(circle at top left, #e6efff 0%, #f6f8ff 45%, #f4f5f7 100%);
          color: #1e2d45;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .rie-shell {
          max-width: 1080px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .card {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #dce3f3;
          box-shadow: 0 8px 20px rgba(25, 47, 95, 0.08);
          padding: 20px;
        }

        .rie-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
          border-bottom: 4px solid #1f6eff;
        }

        .rie-header h1 {
          margin: 0;
          color: #1d3d8f;
          font-size: 2rem;
        }

        .rie-header p {
          margin: 8px 0 0;
          color: #566989;
        }

        .risk {
          min-width: 220px;
          border-radius: 12px;
          padding: 12px;
          display: grid;
          gap: 4px;
          border: 1px solid;
          font-weight: 700;
        }

        .risk small {
          font-weight: 500;
        }

        .risk.high {
          background: #ffe9e9;
          border-color: #fca5a5;
          color: #b91c1c;
        }

        .risk.medium {
          background: #fff7e6;
          border-color: #f7d58b;
          color: #a16207;
        }

        .risk.low {
          background: #e9f9ef;
          border-color: #86efac;
          color: #166534;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .section-head h2,
        .card h2 {
          margin: 0;
          color: #1f2f4f;
        }

        .connected {
          margin: 4px 0 14px;
          color: #0f8a4a;
          font-weight: 700;
        }

        .doc-list {
          display: grid;
          gap: 10px;
        }

        .doc-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          align-items: center;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #dbe4f5;
          background: #f9fbff;
        }

        .badge {
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .badge.fetched {
          background: #dcfce7;
          color: #166534;
        }

        .badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .btn {
          border: none;
          border-radius: 8px;
          padding: 9px 12px;
          color: #fff;
          cursor: pointer;
          font-weight: 700;
        }

        .btn.primary {
          background: #1f6eff;
        }

        .btn.secondary {
          background: #2563eb;
        }

        .btn.success {
          background: #0f9b55;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 10px;
          margin-top: 12px;
        }

        .upload-grid input {
          padding: 10px;
          border: 1px solid #cfd9eb;
          border-radius: 8px;
          background: #fff;
        }

        .upload-msg {
          margin: 12px 0;
          color: #166534;
          font-weight: 700;
        }

        .uploaded-list {
          display: grid;
          gap: 8px;
        }

        .uploaded-item {
          display: flex;
          justify-content: space-between;
          background: #f2faf5;
          border: 1px solid #bbf7d0;
          padding: 10px;
          border-radius: 8px;
        }

        .uploaded-item .ok {
          color: #15803d;
          font-weight: 700;
        }

        .analysis {
          border: 2px solid #c5d5ff;
          background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
        }

        .results-grid {
          display: grid;
          gap: 12px;
          margin-top: 12px;
        }

        .result-card {
          border-radius: 12px;
          padding: 14px;
          border-left: 5px solid;
        }

        .result-card h3 {
          margin: 0;
        }

        .result-card p {
          margin: 8px 0;
          color: #3f4f6d;
        }

        .result-card.critical {
          background: #fff1f1;
          border-color: #ef4444;
        }

        .result-card.moderate {
          background: #fffaed;
          border-color: #f59e0b;
        }

        .result-card.low {
          background: #eef4ff;
          border-color: #60a5fa;
        }

        .result-card.resolved {
          background: #ecfdf3;
          border-color: #22c55e;
        }

        .result-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .priority {
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 0.78rem;
          font-weight: 800;
        }

        .priority.critical {
          background: #fecaca;
          color: #991b1b;
        }

        .priority.moderate {
          background: #fde68a;
          color: #92400e;
        }

        .priority.low {
          background: #bfdbfe;
          color: #1d4ed8;
        }

        .fix {
          margin-top: 10px;
          background: #edf8ef;
          border: 1px solid #b7e4c7;
          color: #166534;
          padding: 10px;
          border-radius: 8px;
        }

        @media (max-width: 900px) {
          .doc-row {
            grid-template-columns: 1fr;
          }

          .actions {
            justify-content: flex-start;
          }

          .upload-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Rejection;
