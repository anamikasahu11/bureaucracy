import React, { useState, useEffect } from "react";

export default function DigiLockerIntegration({ userProfile, onDocumentsFetched, uploadDocumentType, onUploadComplete }) {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState("");

  useEffect(() => {
    if (uploadDocumentType) {
      const names = {
        aadhaar: "Aadhaar Card",
        pan: "PAN Card",
        incomeCert: "Income Certificate",
        casteCert: "Caste Certificate",
        educationDocs: "Education Document",
        domicile: "Domicile Certificate",
        rationCard: "Ration Card",
        disabilityCert: "Disability Certificate"
      };
      setDocumentName(names[uploadDocumentType] || "Document");
    }
  }, [uploadDocumentType]);

  const mockDigiLockerDocuments = {
    aadhaar: {
      name: "Aadhaar Card",
      found: true,
      extractedData: {
        name: userProfile?.name || "Alina Sharma",
        dob: userProfile?.dob || "1995-05-15",
        gender: userProfile?.gender || "Female",
        address: `${userProfile?.district || "Mumbai"}, ${userProfile?.state || "Maharashtra"}`,
        verificationStatus: "verified"
      }
    },
    pan: {
      name: "PAN Card",
      found: true,
      extractedData: {
        name: userProfile?.name || "Alina Sharma",
        financialIdentity: "AXZPS1234A",
        verificationStatus: "verified"
      }
    },
    incomeCert: {
      name: "Income Certificate",
      found: false,
      extractedData: null
    },
    casteCert: {
      name: "Caste Certificate",
      found: userProfile?.category && ["SC", "ST", "OBC"].includes(userProfile.category),
      extractedData: userProfile?.category ? { category: userProfile.category, verificationStatus: "verified" } : null
    },
    educationDocs: {
      name: "Education Documents (10th/12th Marksheet)",
      found: true,
      extractedData: {
        qualification: "12th Pass",
        board: "CBSE",
        yearOfPassing: "2013",
        verificationStatus: "verified"
      }
    },
    domicile: {
      name: "Domicile Certificate",
      found: true,
      extractedData: {
        state: userProfile?.state || "Maharashtra",
        yearOfIssue: "2020",
        verificationStatus: "verified"
      }
    },
    rationCard: {
      name: "Ration Card",
      found: false,
      extractedData: null
    },
    disabilityCert: {
      name: "Disability Certificate",
      found: false,
      extractedData: null
    }
  };

  const handleFetchDocuments = async () => {
    setIsFetching(true);
    setFetchError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const fetchedDocuments = Object.entries(mockDigiLockerDocuments).reduce((acc, [key, doc]) => {
        acc[key] = doc;
        return acc;
      }, {});

      onDocumentsFetched(fetchedDocuments);
    } catch (error) {
      setFetchError("Failed to fetch documents from DigiLocker. Please try again.");
      setIsFetching(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadDocumentType) return;
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const extractedMap = {
        aadhaar: { name: userProfile?.name || "N/A", dob: userProfile?.dob || "", verificationStatus: "verified" },
        pan: { financialIdentity: "USERPAN1234", verificationStatus: "verified" },
        incomeCert: { annualIncome: "250000", verificationStatus: "verified" },
        casteCert: { category: userProfile?.category || "General", verificationStatus: "verified" },
        educationDocs: { qualification: "12th Pass", board: "State Board", yearOfPassing: "2022", verificationStatus: "verified" },
        domicile: { state: userProfile?.state || "", verificationStatus: "verified" },
        rationCard: { familyMembers: "4", cardNumber: "RC12345", verificationStatus: "verified" },
        disabilityCert: { disabilityPercentage: "40%", verificationStatus: "verified" }
      };

      const updatedDocuments = {
        ...mockDigiLockerDocuments,
        [uploadDocumentType]: {
          name: documentName || uploadDocumentType,
          found: true,
          extractedData: extractedMap[uploadDocumentType] || { verificationStatus: "verified" }
        }
      };

      if (onUploadComplete) {
        onUploadComplete(updatedDocuments);
      } else if (onDocumentsFetched) {
        onDocumentsFetched(updatedDocuments);
      }

      setSelectedFile(null);
      setUploadError(null);
      setUploading(false);
    } catch (error) {
      setUploadError("Upload failed. Try again.");
      setUploading(false);
    }
  };

  return (
    <div className="form-section">
      <h2>🔐 DigiLocker Integration</h2>
      <p>Connect your DigiLocker account to automatically fetch and verify your documents.</p>

      {uploadDocumentType && (
        <div className="upload-to-digilocker">
          <h3>📤 Upload {uploadDocumentType} to DigiLocker</h3>
          <div className="form-group">
            <label>Document Name</label>
            <input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>
          <div className="form-group">
            <label>Upload File</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            {selectedFile && <p className="file-info">Selected: {selectedFile.name}</p>}
          </div>
          {uploadError && <p className="error-message">{uploadError}</p>}
          <button
            onClick={handleUploadDocument}
            className="submit-btn"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload to DigiLocker"}
          </button>
        </div>
      )}
      <div className="digilocker-info">
        <div className="info-card">
          <h3>📄 What we'll fetch from DigiLocker</h3>
          <ul>
            <li>✓ Identity Documents (Aadhaar, PAN)</li>
            <li>✓ Address Proof (Domicile, Ration Card)</li>
            <li>✓ Education Documents</li>
            <li>✓ Category Certificates (if applicable)</li>
            <li>✓ Disability Certificate (if applicable)</li>
          </ul>
        </div>

        <div className="user-profile-summary">
          <h3>Your Profile Summary</h3>
          <ul>
            <li><strong>Name:</strong> {userProfile?.name}</li>
            <li><strong>Mobile:</strong> {userProfile?.mobile}</li>
            <li><strong>State:</strong> {userProfile?.state}</li>
            <li><strong>District:</strong> {userProfile?.district}</li>
            <li><strong>Age:</strong> {userProfile?.age || "Calculating..."}</li>
            <li><strong>Category:</strong> {userProfile?.category || "General"}</li>
            {userProfile?.disability === "Yes" && <li><strong>Disability:</strong> Yes</li>}
          </ul>
        </div>
      </div>

      {fetchError && (
        <div className="error-message">
          {fetchError}
        </div>
      )}

      <button 
        onClick={handleFetchDocuments} 
        disabled={isFetching}
        className="submit-btn"
      >
        {isFetching ? "Fetching Documents..." : "🔗 Connect DigiLocker & Fetch Documents"}
      </button>

      <p className="info-text">
        💡 Your documents will be securely fetched and verified. No personal data is stored.
      </p>
    </div>
  );
}
