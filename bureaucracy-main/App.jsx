import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import DigiLockerIntegration from "./DigiLockerIntegration";
import EligibilityPanel from "./EligibilityPanel";
import EligibilityAnalysisPage from "./EligibilityAnalysisPage";
import DynamicQuestionFlow from "./DynamicQuestionFlow";
import EligibilityResultPanel from "./EligibilityResultPanel";
import LockerPanelLite from "./LockerPanelLite";
import GuidedWorkflowPage from "./GuidedWorkflowPage";
import RejectionEnginePage from "./RejectionEnginePage";
import GovGuruAssistant from "./GovGuruAssistant";
import DataExtractionEngine from "./DataExtractionEngine";
import { EligibilityEngine } from "./EligibilityEngine";
import "./styles.css";

export default function App() {
  const {
    userProfile,
    digiLockerDocuments,
    extractedData,
    answers,
    lockerData,
    updateDigiLockerDocuments,
    updateExtractedData,
    updateAnswers,
    updateLockerData,
    login,
    logout,
    isLoading
  } = useContext(UserContext);

  const [currentPage, setCurrentPage] = useState("login");
  const [eligibilitySchemes, setEligibilitySchemes] = useState([]);
  const [verificationIssues, setVerificationIssues] = useState([]);
  const [missingDocuments, setMissingDocuments] = useState([]);
  const [uploadDocumentType, setUploadDocumentType] = useState(null);

  // Initialize to home if user already logged in (on reload)
  useEffect(() => {
    if (!isLoading && userProfile && currentPage === "login") {
      setCurrentPage("home");
    }
  }, [isLoading, userProfile]);

  const handleLoginSuccess = (profile) => {
    login(profile);
    setCurrentPage("home");
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const processFetchedDocuments = (documents, nextPage = "eligibility") => {
    updateDigiLockerDocuments(documents);

    const extractionEngine = new DataExtractionEngine(documents);
    const extractionResult = extractionEngine.extract();

    updateExtractedData({
      ...extractionResult.extractedData,
      age: userProfile?.age // Include age from login
    });

    setVerificationIssues(extractionResult.verificationIssues);
    setMissingDocuments(extractionEngine.getMissingDocuments());

    setCurrentPage(nextPage);
  };

  const handleDocumentsFetched = (documents) => {
    processFetchedDocuments(documents, "eligibility");
  };

  const handleStartDocumentUpload = (docKey) => {
    setUploadDocumentType(docKey);
    setCurrentPage("digilocker");
  };

  const handleUploadComplete = (updatedDocuments) => {
    setUploadDocumentType(null);
    processFetchedDocuments(updatedDocuments, "eligibility");
  };

  const handleProceedToAnalysis = (manualDocs = {}) => {
    const existingDocs = digiLockerDocuments || {};
    const mergedDocs = { ...existingDocs };

    // Integrate manual documents into document store
    Object.keys(manualDocs).forEach((docKey) => {
      mergedDocs[docKey] = {
        name: manualDocs[docKey]?.label || docKey,
        found: true,
        extractedData: manualDocs[docKey]?.data || { verificationStatus: "manual" }
      };
    });

    // Reprocess documents and move to analysis
    processFetchedDocuments(mergedDocs, "analysis");
  };

  const handleAnswersSubmit = (answersData) => {
    updateAnswers(answersData);

    // Run eligibility engine
    const eligibilityEngine = new EligibilityEngine(userProfile, extractedData, answersData);
    const schemes = eligibilityEngine.evaluateEligibility();

    setEligibilitySchemes(schemes);
    setCurrentPage("results");
  };

  const handleGoHome = () => {
    setCurrentPage("home");
  };

  const handleGoBack = () => {
    if (currentPage === "results") {
      setCurrentPage("questions");
    } else if (currentPage === "questions") {
      setCurrentPage("digilocker");
    } else if (currentPage === "digilocker") {
      setCurrentPage("home");
    } else {
      setCurrentPage("home");
    }
  };

  const handleRestartProcess = () => {
    updateDigiLockerDocuments(null);
    updateExtractedData(null);
    updateAnswers(null);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    logout();
    setCurrentPage("login");
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>🏛️ Bureaucracy Navigator</h1>
        </header>
        <main className="app-main">
          <p>Loading your application...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🏛️ Bureaucracy Navigator</h1>
        {userProfile && (
          <div className="header-info">
            <p className="header-user">Logged in as: {userProfile.name}</p>
            <p className="header-progress">
              {currentPage === "home" && "📍 Home"}
              {currentPage === "digilocker" && "📍 Document Verification"}
              {currentPage === "questions" && "📍 Information Review"}
              {currentPage === "results" && "📍 Eligibility Results"}
              {currentPage === "locker" && "📍 Document Locker"}
              {currentPage === "guided_workflow" && "📍 Guided Workflow"}
              {currentPage === "rejection" && "📍 Rejection Analysis"}
            </p>
          </div>
        )}
      </header>

      <main className="app-main">
        {!userProfile ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : currentPage === "home" ? (
          <HomePage onNavigate={handleNavigate} onLogout={handleLogout} />
        ) : currentPage === "eligibility" ? (
          <EligibilityPanel
            userProfile={userProfile}
            digiLockerDocuments={digiLockerDocuments}
            missingDocuments={missingDocuments}
            onFetchDocuments={handleDocumentsFetched}
            onUploadToDigiLocker={handleStartDocumentUpload}
            onProceed={handleProceedToAnalysis}
            onBack={handleGoHome}
          />
        ) : currentPage === "digilocker" ? (
          <DigiLockerIntegration
            userProfile={userProfile}
            onDocumentsFetched={handleDocumentsFetched}
            uploadDocumentType={uploadDocumentType}
            onUploadComplete={handleUploadComplete}
          />
        ) : currentPage === "analysis" ? (
          <EligibilityAnalysisPage
            userProfile={userProfile}
            digiLockerDocuments={digiLockerDocuments}
            answers={answers}
            onFinish={(schemes, extractedDataFromAnalysis) => {
              setEligibilitySchemes(schemes);
              updateExtractedData(extractedDataFromAnalysis);
              setCurrentPage("results");
            }}
            onBack={() => setCurrentPage("eligibility")}
          />
        ) : currentPage === "questions" ? (
          <DynamicQuestionFlow
            extractedData={extractedData}
            verificationIssues={verificationIssues}
            onDataUpdate={handleAnswersSubmit}
            onBack={handleGoBack}
          />
        ) : currentPage === "results" ? (
          <EligibilityResultPanel
            schemes={eligibilitySchemes}
            extractedData={extractedData}
            answers={answers}
            missingDocuments={missingDocuments}
            onBack={handleRestartProcess}
          />
        ) : currentPage === "locker" ? (
          <LockerPanelLite
            lockerData={lockerData}
            userProfile={userProfile}
            onLockerUpdate={updateLockerData}
            onBack={handleGoHome}
          />
        ) : currentPage === "guided_workflow" ? (
          <GuidedWorkflowPage onBack={handleGoHome} />
        ) : currentPage === "rejection" ? (
          <RejectionEnginePage onBack={handleGoHome} />
        ) : null}
      </main>

      {userProfile && <GovGuruAssistant />}

      <footer className="app-footer">
        <p>© 2026 Bureaucracy Navigator | Making Government Services Accessible</p>
      </footer>
    </div>
  );
}
