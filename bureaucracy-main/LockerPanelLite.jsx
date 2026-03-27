import React, { useState, useEffect } from "react";

const CATEGORY_TREE = [
  {
    id: "identity",
    name: "Identity Documents",
    icon: "🆔",
    subcategories: ["Aadhaar Card", "PAN Card"]
  },
  {
    id: "address",
    name: "Address / Residence",
    icon: "🏠",
    subcategories: ["Domicile Certificate", "Ration Card"]
  },
  {
    id: "financial",
    name: "Financial Proof",
    icon: "💰",
    subcategories: ["Income Certificate", "Bank Passbook"]
  },
  {
    id: "education",
    name: "Education",
    icon: "🎓",
    subcategories: ["10th Marksheet", "12th Marksheet", "Degree Certificate"]
  },
  {
    id: "special",
    name: "Category / Special Eligibility",
    icon: "📜",
    subcategories: ["Caste Certificate", "Disability Certificate", "Minority Certificate"]
  },
  {
    id: "business",
    name: "Business / Employment",
    icon: "🏢",
    subcategories: ["MSME Registration", "Employment Exchange Card"]
  }
];

export default function LockerPanelLite({ lockerData, onLockerUpdate, onBack, userProfile }) {
  const [documentName, setDocumentName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [file, setFile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [docs, setDocs] = useState(lockerData?.documents || []);

  useEffect(() => {
    const fromStorage = localStorage.getItem("lockerDocuments");
    if (fromStorage) {
      try {
        setDocs(JSON.parse(fromStorage));
      } catch (err) {
        console.warn("Could not parse lockerDocuments from localStorage", err);
      }
    }
  }, []);

  useEffect(() => {
    onLockerUpdate?.({ ...lockerData, documents: docs });
    localStorage.setItem("lockerDocuments", JSON.stringify(docs));
  }, [docs]);

  const handleDropdownToggle = () => {
    setIsDropdownOpen((open) => !open);
  };

  const handleCategoryClick = (categoryId) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleSubcategorySelect = (categoryId, subcategory) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategory(subcategory);
    setIsDropdownOpen(false);
    setExpandedCategory(null);
  };

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const addDocument = () => {
    if (!documentName.trim()) {
      alert("Please enter a document name.");
      return;
    }
    if (!selectedSubcategory) {
      alert("Please select a document type subcategory.");
      return;
    }
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const newDoc = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: documentName.trim(),
      categoryId: selectedCategoryId,
      category: CATEGORY_TREE.find((cat) => cat.id === selectedCategoryId)?.name || "",
      subcategory: selectedSubcategory,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toLocaleDateString(),
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    };

    const updated = [newDoc, ...docs];
    setDocs(updated);
    setDocumentName("");
    setSelectedCategoryId("");
    setSelectedSubcategory("");
    setFile(null);
    setIsDropdownOpen(false);
    setExpandedCategory(null);
  };

  const deleteDocument = (idx) => {
    const updatedDocs = docs.filter((_, index) => index !== idx);
    setDocs(updatedDocs);
  };

  const activeCategory = CATEGORY_TREE.find((cat) => cat.id === selectedCategoryId);

  return (
    <div className="locker-panel-container">
      <div className="locker-header">
        <h1>Bureaucracy Navigator</h1>
        {userProfile?.name && <p className="locker-user">Logged in as: {userProfile.name}</p>}
      </div>

      <div className="form-section locker-card">
        <h2>Locker Panel - Document Management</h2>
        <p>Upload and organize your documents. These are used during eligibility checks.</p>

        <div className="form-row">
          <div className="form-group">
            <label>Document Name</label>
            <input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., Aadhaar, PAN, Degree Certificate"
            />
          </div>

          <div className="form-group dropdown-group">
            <label>Document Type</label>
            <button type="button" className="dropdown-input" onClick={handleDropdownToggle}>
              {selectedSubcategory ? `${activeCategory?.icon || "📁"} ${activeCategory?.name} / ${selectedSubcategory}` : "Select category → subcategory"}
              <span className="dropdown-arrow">▾</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-panel">
                {CATEGORY_TREE.map((category) => (
                  <div key={category.id} className="dropdown-category">
                    <button type="button" className="dropdown-category-btn" onClick={() => handleCategoryClick(category.id)}>
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                      <span>{expandedCategory === category.id ? "▾" : "▸"}</span>
                    </button>

                    {expandedCategory === category.id && (
                      <div className="subcategory-list">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            className="subcategory-item"
                            onClick={() => handleSubcategorySelect(category.id, sub)}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Upload Document</label>
            <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={handleFileChange} />
            {file && <p className="file-info">Selected file: {file.name}</p>}
          </div>
        </div>

        <button type="button" className="submit-btn" onClick={addDocument}>
          + Add Document
        </button>
      </div>

      <div className="locker-docs-section">
        <h3>Locker Documents ({docs.length})</h3>
        {docs.length === 0 ? (
          <p className="empty-text">No documents uploaded yet</p>
        ) : (
          <div className="documents-list">
            {docs.map((doc, idx) => (
              <div key={doc.id} className="document-card">
                <div className="document-head">
                  <h4>{doc.name}</h4>
                  <button className="delete-btn" onClick={() => deleteDocument(idx)}>Delete</button>
                </div>
                <p><strong>Type:</strong> {doc.category} → {doc.subcategory}</p>
                <p><strong>File:</strong> {doc.fileName}</p>
                <p><strong>Uploaded:</strong> {doc.uploadedAt}</p>
                {doc.preview && <img src={doc.preview} alt={doc.name} className="doc-preview" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onBack} className="back-btn">← Back to Home</button>

      {/*
        Legacy LockerPanelLite code (commented for reference)
        (This block is kept as per requirement to keep old code, without execution)

        import React, { useState } from "react";

        export default function LockerPanelLite({ lockerData, onLockerUpdate, onBack }) {
          const [documentName, setDocumentName] = useState("");
          const [documentType, setDocumentType] = useState("identity");

          const addDocument = () => {
            if (!documentName.trim()) return;
            const nextDocs = [...lockerData.documents, { name: documentName.trim(), type: documentType, status: "uploaded", uploadedAt: new Date().toLocaleDateString() }];
            onLockerUpdate({ ...lockerData, documents: nextDocs });
            setDocumentName("");
          };

          const deleteDocument = (idx) => {
            const nextDocs = lockerData.documents.filter((_, i) => i !== idx);
            onLockerUpdate({ ...lockerData, documents: nextDocs });
          };

          return (
            <div className="form-section">
              <h2>📂 Locker Panel - Document Management</h2>
              <p>Upload and organize your documents. These are used during eligibility checks.</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Document Name</label>
                  <input value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder="e.g., Aadhaar, PAN, Degree Certificate" />
                </div>
                <div className="form-group">
                  <label>Document Type</label>
                  <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                    <option value="identity">Identity Proof</option>
                    <option value="address">Address Proof</option>
                    <option value="income">Income Certificate</option>
                    <option value="education">Education Cert</option>
                    <option value="disability">Disability Certificate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button type="button" onClick={addDocument} style={{ marginBottom: "20px" }}>
                + Add Document
              </button>

              ...
            </div>
          );
        }
      */}
    </div>
  );
}

