import React, { useState } from "react";

export default function EligibilityResultPanel({ schemes, extractedData, answers, onBack, missingDocuments }) {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const eligibleSchemes = schemes.filter(s => s.status.includes("✅"));
  const almostEligible = schemes.filter(s => s.status.includes("⚠️") || s.status.includes("⏰"));
  const notEligible = schemes.filter(s => s.status.includes("❌"));

  const filteredSchemes = schemes.filter(scheme => {
    if (filterStatus === "eligible") return scheme.status.includes("✅");
    if (filterStatus === "almost") return scheme.status.includes("⚠️") || scheme.status.includes("⏰");
    if (filterStatus === "not") return scheme.status.includes("❌");
    return true;
  });

  const confidenceScore = Math.round(
    (schemes.filter(s => s.status.includes("✅")).length / schemes.length) * 100 || 0
  );

  return (
    <div className="form-section">
      <h2>✅ Your Eligibility Results</h2>
      <p>Based on your verified documents and information, here are all available schemes for you.</p>

      {/* Overall Dashboard */}
      <div className="eligibility-dashboard">
        <div className="dashboard-card">
          <h3>📊 Overall Assessment</h3>
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-number eligible-count">{eligibleSchemes.length}</span>
              <span className="stat-label">Eligible Schemes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number almost-count">{almostEligible.length}</span>
              <span className="stat-label">Almost Eligible</span>
            </div>
            <div className="stat-item">
              <span className="stat-number not-count">{notEligible.length}</span>
              <span className="stat-label">Not Eligible</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>🎯 Profile Confidence</h3>
          <div className="confidence-meter">
            <div className="confidence-bar" style={{ width: `${confidenceScore}%` }}></div>
          </div>
          <p className="confidence-text">{confidenceScore}% documents verified</p>
        </div>
      </div>

      {/* Missing Documents Alert */}
      {missingDocuments && missingDocuments.length > 0 && (
        <div className="missing-docs-box">
          <h3>📄 Missing Documents</h3>
          <p>Upload these documents to improve eligibility and increase confidence:</p>
          <ul>
            {missingDocuments.map((doc, idx) => (
              <li key={idx}>
                <span className="doc-name">{doc.name}</span>
                <button className="upload-link">Upload in Locker</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          All ({schemes.length})
        </button>
        <button
          className={`filter-btn eligible ${filterStatus === "eligible" ? "active" : ""}`}
          onClick={() => setFilterStatus("eligible")}
        >
          ✅ Eligible ({eligibleSchemes.length})
        </button>
        <button
          className={`filter-btn almost ${filterStatus === "almost" ? "active" : ""}`}
          onClick={() => setFilterStatus("almost")}
        >
          ⚠️ Almost ({almostEligible.length})
        </button>
        <button
          className={`filter-btn not ${filterStatus === "not" ? "active" : ""}`}
          onClick={() => setFilterStatus("not")}
        >
          ❌ Not ({notEligible.length})
        </button>
      </div>

      {/* Schemes List */}
      <div className="schemes-container">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className={`scheme-card ${scheme.color} ${selectedScheme?.id === scheme.id ? "expanded" : ""}`}
            onClick={() => setSelectedScheme(selectedScheme?.id === scheme.id ? null : scheme)}
          >
            <div className="scheme-header-row">
              <div className="scheme-title">
                <h4>{scheme.name}</h4>
                <p className="scheme-status-label">{scheme.status}</p>
              </div>
              <div className="confidence-badge">
                <span className="confidence-score">{scheme.confidence}%</span>
                <span className="confidence-label">Confidence</span>
              </div>
            </div>

            <div className="scheme-summary">
              <p><strong>Requirement:</strong> {scheme.requirements}</p>
              <p><strong>Benefit:</strong> {scheme.benefit}</p>
            </div>

            {selectedScheme?.id === scheme.id && (
              <div className="scheme-details">
                <div className="detail-section">
                  <h5>📌 Why {scheme.status.includes("✅") ? "Eligible" : "Not Eligible"}</h5>
                  <p>{scheme.reason}</p>
                </div>

                <div className="detail-section">
                  <h5>📋 Required Documents</h5>
                  <ul>
                    {scheme.documents.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>

                {scheme.timeline && (
                  <div className="detail-section">
                    <h5>⏱️ Timeline</h5>
                    <p className="timeline">{scheme.timeline}</p>
                  </div>
                )}

                {scheme.fixSuggestions && scheme.fixSuggestions.length > 0 && (
                  <div className="detail-section fix-suggestions">
                    <h5>🔧 How to Become Eligible</h5>
                    <ul>
                      {scheme.fixSuggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {scheme.status.includes("✅") && (
                  <button className="action-btn apply-btn">Apply Now →</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Multi-Scheme Comparison */}
      {eligibleSchemes.length > 1 && (
        <div className="comparison-section">
          <h3>📊 Compare Top Schemes</h3>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Scheme</th>
                  <th>Monthly Benefit</th>
                  <th>Max Amount</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {eligibleSchemes.slice(0, 3).map(scheme => (
                  <tr key={scheme.id}>
                    <td>{scheme.name}</td>
                    <td>{scheme.benefit.split(",")[0] || "Varies"}</td>
                    <td>{scheme.benefit.split("|")[0] || "Check Details"}</td>
                    <td>Ongoing</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Your Verified Information */}
      <div className="verified-info-box">
        <h3>✔️ Your Verified Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Name</span>
            <span className="value verified">{extractedData?.name} ✔</span>
          </div>
          <div className="info-item">
            <span className="label">Age</span>
            <span className="value">{extractedData?.age} years</span>
          </div>
          <div className="info-item">
            <span className="label">Category</span>
            <span className="value">{extractedData?.category || "General"}</span>
          </div>
          <div className="info-item">
            <span className="label">Income</span>
            <span className="value">₹{parseInt(answers?.income).toLocaleString() || "Not provided"}</span>
          </div>
          <div className="info-item">
            <span className="label">Employment</span>
            <span className="value">{answers?.employmentStatus}</span>
          </div>
          <div className="info-item">
            <span className="label">State</span>
            <span className="value">{extractedData?.state}</span>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button onClick={onBack} className="back-btn">← Go Back</button>
        <button className="next-btn" onClick={() => {
          const payload = {
            userProfile: extractedData,
            answers,
            schemes,
            missingDocuments
          };
          const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `eligibility-report-${(extractedData?.name || "user").replace(/\s+/g, "_")}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }}>
          Download Report →
        </button>
      </div>
    </div>
  );
}
