// EligibilityEngine.js
// Core logic for determining scheme eligibility with detailed reasoning

export class EligibilityEngine {
  constructor(userProfile, extractedData, answers) {
    this.userProfile = userProfile;
    this.extractedData = extractedData;
    this.answers = answers;
    this.age = userProfile?.age || 0;
    this.income = parseInt(answers?.income) || 0;
    this.category = extractedData?.category || userProfile?.category || "General";
    this.employmentStatus = answers?.employmentStatus || "Student";
    this.gender = extractedData?.gender || userProfile?.gender || "";
    this.state = extractedData?.state || userProfile?.state || "";
    this.disability = extractedData?.disability || "No";
    this.qualification = extractedData?.qualification || "";
  }

  evaluateEligibility() {
    const schemes = [
      this.evaluateSeniorCitizenPension(),
      this.evaluateDisabilityBenefit(),
      this.evaluateLowIncomeSupportProgram(),
      this.evaluateSCSTBenefits(),
      this.evaluateWomenEmpowermentScheme(),
      this.evaluateYouthSkillDevelopment(),
      this.evaluateStudentScholarship(),
      this.evaluateAgriculturalSubsidy(),
      this.evaluateGoAheadScheme(),
      this.evaluateTechStartupFund()
    ];

    return schemes.filter(scheme => scheme !== null);
  }

  evaluateSeniorCitizenPension() {
    if (this.age < 60) {
      return {
        id: "senior_pension",
        name: "Senior Citizen Pension",
        status: "⏰ Not Yet Eligible",
        color: "upcoming",
        requirements: "Age 60+",
        currentStatus: `Age ${this.age}`,
        reason: `You will become eligible on ${this.calculateFutureDate(60 - this.age)} when you turn 60`,
        benefit: "₹1,500 - ₹3,000/month",
        documents: ["Aadhaar", "Age Proof"],
        confidence: 95,
        fixSuggestions: null,
        timeline: `${60 - this.age} years remaining`
      };
    }

    return {
      id: "senior_pension",
      name: "Senior Citizen Pension",
      status: "✅ Eligible",
      color: "eligible",
      requirements: "Age 60+",
      currentStatus: `Age ${this.age}`,
      reason: "You have reached the senior citizen age (60+)",
      benefit: "₹1,500 - ₹3,000/month",
      documents: ["Aadhaar", "Age Proof"],
      confidence: 95,
      fixSuggestions: null
    };
  }

  evaluateDisabilityBenefit() {
    if (this.disability !== "Yes") {
      return {
        id: "disability_benefit",
        name: "Disability Support Scheme",
        status: "❌ Not Eligible",
        color: "not-eligible",
        requirements: "Disability Certificate",
        currentStatus: "No disability recorded",
        reason: "Disability certificate not found. If you have a disability, please upload the certificate.",
        benefit: "₹3,000/month + medical support",
        documents: ["Disability Certificate", "Aadhaar"],
        confidence: 0,
        fixSuggestions: ["Upload Disability Certificate in Locker Panel"]
      };
    }

    return {
      id: "disability_benefit",
      name: "Disability Support Scheme",
      status: "✅ Eligible",
      color: "eligible",
      requirements: "Disability recorded",
      currentStatus: "Disability: Yes",
      reason: "Disability certificate verified from DigiLocker",
      benefit: "₹3,000/month + medical support + employment assistance",
      documents: ["Disability Certificate", "Aadhaar"],
      confidence: 90,
      fixSuggestions: null
    };
  }

  evaluateLowIncomeSupportProgram() {
    const threshold = 300000;

    if (this.income === 0) {
      return {
        id: "low_income_support",
        name: "Low Income Support Program",
        status: "⚠️ Requires Income Info",
        color: "missing-info",
        requirements: `Annual income < ₹${threshold.toLocaleString()}`,
        currentStatus: "Income not provided",
        reason: "Please provide your annual income to check eligibility.",
        benefit: "₹500/month direct transfer",
        documents: ["Income Certificate or Self-declaration"],
        confidence: 0,
        fixSuggestions: ["Enter your annual income in the form"]
      };
    }

    if (this.income < threshold) {
      return {
        id: "low_income_support",
        name: "Low Income Support Program",
        status: "✅ Eligible",
        color: "eligible",
        requirements: `Annual income < ₹${threshold.toLocaleString()}`,
        currentStatus: `Income: ₹${this.income.toLocaleString()}`,
        reason: `Your income (₹${this.income.toLocaleString()}) is below the threshold of ₹${threshold.toLocaleString()}`,
        benefit: "₹500/month direct transfer + health insurance",
        documents: ["Income Certificate", "Bank Account"],
        confidence: 85,
        fixSuggestions: null
      };
    }

    return {
      id: "low_income_support",
      name: "Low Income Support Program",
      status: "❌ Not Eligible",
      color: "not-eligible",
      requirements: `Annual income < ₹${threshold.toLocaleString()}`,
      currentStatus: `Income: ₹${this.income.toLocaleString()}`,
      reason: `Your income exceeds the limit of ₹${threshold.toLocaleString()}`,
      benefit: "₹500/month direct transfer",
      documents: ["Income Certificate"],
      confidence: 0,
      fixSuggestions: [`Income must be below ₹${threshold.toLocaleString()}`]
    };
  }

  evaluateSCSTBenefits() {
    if (this.category === "General" || this.category === "OBC") {
      return {
        id: "scst_benefits",
        name: "SC/ST/OBC Reservation & Benefits",
        status: "❌ Not Eligible",
        color: "not-eligible",
        requirements: "Category: SC/ST/OBC",
        currentStatus: `Category: ${this.category}`,
        reason: `You are in ${this.category} category. This scheme is for SC/ST/OBC only.`,
        benefit: "Educational & employment benefits, scholarships",
        documents: ["Caste Certificate"],
        confidence: 0,
        fixSuggestions: null
      };
    }

    return {
      id: "scst_benefits",
      name: "SC/ST/OBC Reservation & Benefits",
      status: "✅ Eligible",
      color: "eligible",
      requirements: `Category: ${this.category}`,
      currentStatus: `Category: ${this.category}`,
      reason: `You are eligible as a ${this.category} category applicant`,
      benefit: "Scholarships, job reservations, educational loans, housing benefits",
      documents: ["Caste Certificate (Verified)"],
      confidence: 90,
      fixSuggestions: null
    };
  }

  evaluateWomenEmpowermentScheme() {
    if (this.gender !== "Female") {
      return null; // Not eligible, don't show
    }

    if (this.age < 18) {
      return {
        id: "women_empower",
        name: "Women Empowerment Scheme",
        status: "⏰ Not Yet Eligible",
        color: "upcoming",
        requirements: "Female, Age 18+",
        currentStatus: `Age ${this.age}`,
        reason: `You will become eligible on your 18th birthday`,
        benefit: "₹50,000 microcredit, skill training, mentorship",
        documents: ["Aadhaar", "Age Proof"],
        confidence: 85,
        fixSuggestions: null,
        timeline: `${18 - this.age} years remaining`
      };
    }

    return {
      id: "women_empower",
      name: "Women Empowerment Scheme",
      status: "✅ Eligible",
      color: "eligible",
      requirements: "Female applicant, 18+",
      currentStatus: `Female, Age ${this.age}`,
      reason: "You qualify as a female applicant above 18 years",
      benefit: "₹50,000 microcredit, skill training, business mentorship, insurance",
      documents: ["Aadhaar", "Gender Proof"],
      confidence: 90,
      fixSuggestions: null
    };
  }

  evaluateYouthSkillDevelopment() {
    if (this.age < 18 || this.age > 35) {
      return {
        id: "youth_skill",
        name: "Youth Skill Development Program",
        status: "❌ Not Eligible",
        color: "not-eligible",
        requirements: "Age 18-35",
        currentStatus: `Age ${this.age}`,
        reason: `Age limit is 18-35 years. You are ${this.age} years old.`,
        benefit: "Free skill training, job placement, ₹5,000/month stipend",
        documents: ["Aadhaar", "Age Proof"],
        confidence: 0,
        fixSuggestions: null
      };
    }

    return {
      id: "youth_skill",
      name: "Youth Skill Development Program",
      status: "✅ Eligible",
      color: "eligible",
      requirements: "Age 18-35",
      currentStatus: `Age ${this.age}`,
      reason: "You fall within the youth development age group (18-35)",
      benefit: "Free skill training, job placement assistance, ₹5,000/month stipend (6 months)",
      documents: ["Aadhaar", "Education Certificate"],
      confidence: 85,
      fixSuggestions: null
    };
  }

  evaluateStudentScholarship() {
    if (this.employmentStatus !== "Student") {
      return null;
    }

    if (this.income === 0) {
      return {
        id: "student_scholarship",
        name: "Student Scholarship Fund",
        status: "⚠️ Requires Income Info",
        color: "missing-info",
        requirements: "Student, Income < ₹500,000",
        currentStatus: "Income not provided",
        reason: "Please enter family income to determine scholarship amount.",
        benefit: "₹5,000 - ₹50,000/year",
        documents: ["Enrollment Certificate", "Income Certificate"],
        confidence: 0,
        fixSuggestions: ["Enter annual family income"]
      };
    }

    if (this.income < 500000) {
      return {
        id: "student_scholarship",
        name: "Student Scholarship Fund",
        status: "✅ Eligible",
        color: "eligible",
        requirements: "Student, Income < ₹500,000",
        currentStatus: `Student, Income ₹${this.income.toLocaleString()}`,
        reason: "You qualify based on student status and family income",
        benefit: `₹${this.income < 150000 ? "50,000" : "25,000"}/year scholarship`,
        documents: ["Enrollment Certificate", "Income Certificate"],
        confidence: 90,
        fixSuggestions: null
      };
    }

    return {
      id: "student_scholarship",
      name: "Student Scholarship Fund",
      status: "❌ Not Eligible",
      color: "not-eligible",
      requirements: "Student with income < ₹500,000",
      currentStatus: `Income ₹${this.income.toLocaleString()}`,
      reason: "Family income exceeds the scholarship limit",
      benefit: "₹5,000 - ₹50,000/year",
      documents: ["Income Certificate"],
      confidence: 0,
      fixSuggestions: ["Eligible for admission to merit scholarship (age/marks based)"]
    };
  }

  evaluateAgriculturalSubsidy() {
    if (this.employmentStatus !== "Farmer") {
      return null;
    }

    return {
      id: "agri_subsidy",
      name: "Agricultural Subsidy Program",
      status: "✅ Eligible",
      color: "eligible",
      requirements: "Farmer status confirmed",
      currentStatus: "Farmer",
      reason: "You are registered as a farmer",
      benefit: "Fertilizer subsidy (50%), seed subsidy (40%), equipment loans",
      documents: ["Land Certificate", "Farmer ID"],
      confidence: 85,
      fixSuggestions: null
    };
  }

  evaluateGoAheadScheme() {
    if (this.employmentStatus !== "Self-employed") {
      return null;
    }

    if (this.income > 1000000) {
      return {
        id: "go_ahead",
        name: "Go-Ahead Entrepreneurship Scheme",
        status: "❌ Not Eligible",
        color: "not-eligible",
        requirements: "Self-employed, Income < ₹10 lakhs",
        currentStatus: `Income ₹${this.income.toLocaleString()}`,
        reason: "Business income exceeds the limit for startup support",
        benefit: "₹5-10 lakh business loan, mentorship",
        documents: ["Business Registration", "Income Certificate"],
        confidence: 0,
        fixSuggestions: null
      };
    }

    return {
      id: "go_ahead",
      name: "Go-Ahead Entrepreneurship Scheme",
      status: "✅ Eligible",
      color: "eligible",
      requirements: "Self-employed, Income < ₹10 lakhs",
      currentStatus: `Self-employed, Income ₹${this.income.toLocaleString()}`,
      reason: "You qualify as an emerging entrepreneur",
      benefit: "₹5-10 lakh business loan @ 4% interest, 1-year mentorship, tax benefits",
      documents: ["Business Registration", "GST Certificate"],
      confidence: 85,
      fixSuggestions: null
    };
  }

  evaluateTechStartupFund() {
    if (this.age > 40 || this.employmentStatus !== "Self-employed") {
      return null;
    }

    if (!this.qualification.includes("Degree") && !this.qualification.includes("Engineering")) {
      return {
        id: "tech_startup",
        name: "Tech Startup Fund",
        status: "❌ Not Eligible",
        color: "not-eligible",
        requirements: "Tech background (Degree/Engineering), Age < 40",
        currentStatus: `${this.qualification || "12th Pass"}`,
        reason: "Minimum qualification: Bachelor's Degree in any field",
        benefit: "₹25-50 lakh funding, incubation support",
        documents: ["Degree Certificate", "Business Plan"],
        confidence: 0,
        fixSuggestions: ["Complete a degree or certification program"]
      };
    }

    return {
      id: "tech_startup",
      name: "Tech Startup Fund",
      status: "✅ Eligible",
      color: "eligible",
      requirements: "Tech qualification, Self-employed, Age < 40",
      currentStatus: `${this.qualification}, Age ${this.age}`,
      reason: "You meet the founder criteria for tech startup funding",
      benefit: "₹25-50 lakh equity-free funding, 2-year incubation, mentorship",
      documents: ["Degree Certificate", "Business Pitch Document"],
      confidence: 85,
      fixSuggestions: null
    };
  }

  calculateFutureDate(yearsAhead) {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + yearsAhead);
    return futureDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

export default EligibilityEngine;
