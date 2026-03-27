import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext";

// State-District Mapping
const STATE_DISTRICTS = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Aurangabad", "Nashik", "Akola", "Sangli"],
  "Karnataka": ["Bangalore", "Mysore", "Belgaum", "Bijapur", "Gulbarga", "Mangalore", "Tumkur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Kanya Kumari", "Tiruppur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Ghaziabad", "Noida"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Jamnagar", "Bhavnagar", "Gandhinagar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Bikaner", "Ajmer", "Udaipur", "Kota", "Alwar"]
};

export default function LoginPage({ onLoginSuccess }) {
  const { login } = useContext(UserContext);
  const [profile, setProfile] = useState({
    name: "",
    mobile: "",
    email: "",
    state: "",
    district: "",
    dob: "",
    gender: "",
    category: "General",
    disability: ""
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({ month: "", day: "", year: "" });
  const [yearInput, setYearInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    
    // Reset district when state changes
    if (name === "state") {
      setProfile((prev) => ({ ...prev, district: "" }));
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
    setDatePickerStep("month-day");
    setTempDate({ month: "", day: "", year: "" });
    setYearInput("");
  };

  const handleMonthDaySelect = (month, day) => {
    setTempDate((prev) => ({ ...prev, month, day }));
    setDatePickerStep("year");
  };

  const handleYearSelect = (year) => {
    const dateStr = `${year}-${String(tempDate.month).padStart(2, "0")}-${String(tempDate.day).padStart(2, "0")}`;
    setProfile((prev) => ({ ...prev, dob: dateStr }));
    setShowDatePicker(false);
  };

  const handleYearInputChange = (val) => {
    setYearInput(val);
  };

  const confirmYearInput = () => {
    if (yearInput && yearInput.length === 4) {
      handleYearSelect(yearInput);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!profile.name || !profile.mobile || !profile.email || !profile.state || !profile.district || !profile.dob || !profile.disability) {
      alert("Name, Mobile, Email, State, District, DOB, and Disability are required.");
      return;
    }
    const age = calculateAge(profile.dob);
    const profileToSave = { ...profile, age };
    login(profileToSave);
    if (onLoginSuccess) onLoginSuccess(profileToSave);
  };

  return (
    <div className="form-section">
      <h2>🔐 Login & Identity Setup</h2>
      <p>Enter your basic identity information. This will be verified through DigiLocker.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input 
            name="name" 
            value={profile.name} 
            onChange={handleChange} 
            placeholder="e.g., Alina Sharma" 
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Mobile Number *</label>
            <input 
              name="mobile" 
              type="tel" 
              value={profile.mobile} 
              onChange={handleChange} 
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div className="form-group">
            <label>Email ID *</label>
            <input 
              name="email" 
              type="email" 
              value={profile.email} 
              onChange={handleChange} 
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>State *</label>
            <select name="state" value={profile.state} onChange={handleChange} required>
              <option value="">Select State</option>
              {Object.keys(STATE_DISTRICTS).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>District *</label>
            {profile.state ? (
              <select name="district" value={profile.district} onChange={handleChange} required>
                <option value="">Select District</option>
                {STATE_DISTRICTS[profile.state].map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            ) : (
              <input 
                name="district" 
                value={profile.district} 
                disabled 
                placeholder="Select State First"
              />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date of Birth *</label>
            <button 
              type="button"
              className="date-picker-btn"
              onClick={openDatePicker}
            >
              {profile.dob ? new Date(profile.dob).toLocaleDateString() : "Select Date"}
            </button>
          </div>
          <div className="form-group">
            <label>Disability *</label>
            <select name="disability" value={profile.disability} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        {/* AGE FIELD HIDDEN - Still calculated in background */}
        {/* 
        <div className="form-row">
          <div className="form-group">
            <label>Age (Auto-calculated)</label>
            <input 
              type="text" 
              value={calculateAge(profile.dob) || ""} 
              disabled 
              placeholder="Age"
            />
          </div>
        </div>
        */}

        <div className="form-row">
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={profile.gender} onChange={handleChange}>
              <option value="">Select (Optional)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={profile.category} onChange={handleChange}>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>
        </div>

        <p className="info-text">💡 Your data will be verified and linked with official documents through DigiLocker.</p>
        
        <button type="submit" className="submit-btn">Proceed to DigiLocker Fetch →</button>
      </form>

      {/* DATE PICKER MODAL */}
      {showDatePicker && (
        <div className="modal-overlay" onClick={() => setShowDatePicker(false)}>
          <div className="date-picker-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select Date of Birth</h3>
            
            <div className="date-picker-step">
              <div className="date-selector">
                <div className="selector-group">
                  <label>Month</label>
                  <select 
                    value={tempDate.month} 
                    onChange={(e) => setTempDate((prev) => ({ ...prev, month: e.target.value }))}
                  >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleString("default", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-group">
                  <label>Day</label>
                  <select 
                    value={tempDate.day} 
                    onChange={(e) => setTempDate((prev) => ({ ...prev, day: e.target.value }))}
                  >
                    <option value="">Select Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="year-panel">
                <h4>Year</h4>
                <select
                  value={tempDate.year}
                  onChange={(e) => {
                    const yearValue = e.target.value;
                    setTempDate((prev) => ({ ...prev, year: yearValue }));
                    if (yearValue && tempDate.month && tempDate.day) {
                      handleYearSelect(yearValue);
                    }
                  }}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="year-input-group">
                  <label>Or type year</label>
                  <input
                    type="text"
                    placeholder="YYYY"
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    maxLength="4"
                  />
                  <button
                    type="button"
                    className="year-confirm-btn"
                    disabled={yearInput.length !== 4 || !tempDate.month || !tempDate.day}
                    onClick={() => {
                      setTempDate((prev) => ({ ...prev, year: yearInput }));
                      handleYearSelect(yearInput);
                    }}
                  >
                    Confirm Year
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="button"
              className="modal-close-btn"
              onClick={() => setShowDatePicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== OLD CODE (COMMENTED OUT) =====
      <div className="form-row">
        <div className="form-group">
          <label>State *</label>
          <select name="state" value={profile.state} onChange={handleChange} required>
            <option value="">Select State</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Delhi">Delhi</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
        </div>
        <div className="form-group">
          <label>District *</label>
          <input 
            name="district" 
            value={profile.district} 
            onChange={handleChange} 
            placeholder="e.g., Mumbai, Pune"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date of Birth *</label>
          <input 
            name="dob" 
            type="date" 
            value={profile.dob} 
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Age (Auto-calculated)</label>
          <input 
            type="text" 
            value={calculateAge(profile.dob) || ""} 
            disabled 
            placeholder="Age"
          />
        </div>
      </div>
      ===== END OLD CODE ===== */}
    </div>
  );
}
