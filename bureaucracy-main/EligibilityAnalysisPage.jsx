import React, { useEffect, useState } from "react";
import DataExtractionEngine from "./DataExtractionEngine";
import { EligibilityEngine } from "./EligibilityEngine";

export default function EligibilityAnalysisPage({ userProfile, digiLockerDocuments, answers, onFinish, onBack }) {
  const [analysisStatus, setAnalysisStatus] = useState("Analyzing documents and verifying eligibility...");
  const [schemes, setSchemes] = useState([]);
  const [extracted, setExtracted] = useState({});

  useEffect(() => {
    const runAnalysis = async () => {
      setAnalysisStatus("Reading documents from DigiLocker...");

      const extractionEngine = new DataExtractionEngine(digiLockerDocuments || {});
      const extractionResult = extractionEngine.extract();
      const extractedData = {
        ...extractionResult.extractedData,
        age: userProfile?.age
      };

      setExtracted(extractedData);

      setAnalysisStatus("Applying eligibility rules...");
      const engine = new EligibilityEngine(userProfile, extractedData, answers || {});
      const elig = engine.evaluateEligibility();
      setSchemes(elig);

      setAnalysisStatus("Analysis complete. Showing results.");

      if (onFinish) {
        onFinish(elig, extractedData);
      }
    };

    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="form-section">
      <h2>📊 Eligibility Analysis</h2>
      <p>{analysisStatus}</p>

      <div className="analysis-summary">
        <h3>Extracted Profile</h3>
        <ul>
          <li>Name: {extracted?.name || userProfile?.name}</li>
          <li>Age: {extracted?.age || userProfile?.age}</li>
          <li>State: {extracted?.state || userProfile?.state}</li>
          <li>Category: {extracted?.category || userProfile?.category}</li>
          <li>Disability: {extracted?.disability || userProfile?.disability || "No"}</li>
        </ul>
      </div>

      <div className="analysis-schemes">
        <h3>Assessed schemes</h3>
        {schemes.length === 0 ? (
          <p>Calculating eligibility details...</p>
        ) : (
          <ul>
            {schemes.map((scheme) => (
              <li key={scheme.id || scheme.name}>
                <strong>{scheme.name}</strong>: {scheme.status}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="button-group">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <button className="next-btn" onClick={() => onFinish(schemes, extracted)}>
          View Final Results →
        </button>
      </div>
    </div>
  );
}
