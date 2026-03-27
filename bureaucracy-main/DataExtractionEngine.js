// DataExtractionEngine.js
// Processes and extracts data from DigiLocker documents

export class DataExtractionEngine {
  constructor(documents) {
    this.documents = documents;
    this.extractedData = {};
    this.verificationIssues = [];
  }

  extract() {
    this.extractIdentityData();
    this.extractAddressData();
    this.extractEducationData();
    this.extractCategoryData();
    this.crossVerifyData();
    
    return {
      extractedData: this.extractedData,
      verificationIssues: this.verificationIssues,
      confidence: this.calculateConfidence()
    };
  }

  extractIdentityData() {
    const aadhaar = this.documents.aadhaar;
    const pan = this.documents.pan;

    if (aadhaar?.found) {
      this.extractedData.name = aadhaar.extractedData.name;
      this.extractedData.dob = aadhaar.extractedData.dob;
      this.extractedData.gender = aadhaar.extractedData.gender;
      this.extractedData.aadhaarVerified = true;
    }

    if (pan?.found) {
      this.extractedData.pan = pan.extractedData.financialIdentity;
      this.extractedData.panVerified = true;
    }
  }

  extractAddressData() {
    const aadhaar = this.documents.aadhaar;
    const domicile = this.documents.domicile;

    if (aadhaar?.found) {
      this.extractedData.address = aadhaar.extractedData.address;
    }

    if (domicile?.found) {
      this.extractedData.state = domicile.extractedData.state;
      this.extractedData.domicileVerified = true;
    }
  }

  extractEducationData() {
    const educationDocs = this.documents.educationDocs;

    if (educationDocs?.found) {
      this.extractedData.qualification = educationDocs.extractedData.qualification;
      this.extractedData.board = educationDocs.extractedData.board;
      this.extractedData.yearOfPassing = educationDocs.extractedData.yearOfPassing;
      this.extractedData.educationVerified = true;
    }
  }

  extractCategoryData() {
    const casteCert = this.documents.casteCert;
    const disabilityCert = this.documents.disabilityCert;

    if (casteCert?.found) {
      this.extractedData.category = casteCert.extractedData.category;
      this.extractedData.categoryVerified = true;
    }

    if (disabilityCert?.found) {
      this.extractedData.disability = "Yes";
      this.extractedData.disabilityVerified = true;
    } else {
      this.extractedData.disability = "No";
    }
  }

  crossVerifyData() {
    const aadhaar = this.documents.aadhaar;
    const pan = this.documents.pan;

    // Name consistency check
    if (aadhaar?.found && pan?.found) {
      if (aadhaar.extractedData.name !== pan.extractedData.name) {
        this.verificationIssues.push({
          type: "warning",
          message: "⚠️ Name mismatch between Aadhaar and PAN. Please verify.",
          severity: "medium"
        });
      }
    }

    // Missing critical documents
    if (!aadhaar?.found) {
      this.verificationIssues.push({
        type: "critical",
        message: "❌ Aadhaar not found in DigiLocker. Identity verification required.",
        severity: "high"
      });
    }

    if (!pan?.found) {
      this.verificationIssues.push({
        type: "info",
        message: "ℹ️ PAN not found. Financial identity cannot be verified.",
        severity: "low"
      });
    }

    if (!this.documents.incomeCert?.found) {
      this.verificationIssues.push({
        type: "info",
        message: "ℹ️ Income Certificate not found. You'll be asked to enter income manually.",
        severity: "low"
      });
    }
  }

  calculateConfidence() {
    let score = 50; // Base score

    if (this.documents.aadhaar?.found) score += 20;
    if (this.documents.pan?.found) score += 10;
    if (this.documents.domicile?.found) score += 10;
    if (this.documents.educationDocs?.found) score += 5;
    if (this.documents.incomeCert?.found) score += 5;

    if (this.verificationIssues.some(issue => issue.severity === "high")) score -= 15;
    if (this.verificationIssues.some(issue => issue.severity === "medium")) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  getMissingDocuments() {
    const missing = [];
    Object.entries(this.documents).forEach(([key, doc]) => {
      if (!doc.found) {
        missing.push({ key, name: doc.name });
      }
    });
    return missing;
  }
}

export default DataExtractionEngine;
