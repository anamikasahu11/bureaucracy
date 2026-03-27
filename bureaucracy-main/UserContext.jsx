import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [digiLockerDocuments, setDigiLockerDocuments] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [userData, setUserData] = useState({
    name: "Citizen",
    documents: []
  });
  const [lockerData, setLockerData] = useState({ documents: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    const savedDocuments = localStorage.getItem("digiLockerDocuments");
    const savedExtractedData = localStorage.getItem("extractedData");
    const savedAnswers = localStorage.getItem("answers");
    const savedUserData = localStorage.getItem("userData");

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    if (savedDocuments) {
      setDigiLockerDocuments(JSON.parse(savedDocuments));
    }
    if (savedExtractedData) {
      setExtractedData(JSON.parse(savedExtractedData));
    }
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }

    setIsLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    if (digiLockerDocuments) {
      localStorage.setItem("digiLockerDocuments", JSON.stringify(digiLockerDocuments));
    }
  }, [digiLockerDocuments]);

  useEffect(() => {
    if (extractedData) {
      localStorage.setItem("extractedData", JSON.stringify(extractedData));
    }
  }, [extractedData]);

  useEffect(() => {
    if (answers) {
      localStorage.setItem("answers", JSON.stringify(answers));
    }
  }, [answers]);

  useEffect(() => {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [userData]);

  const login = (profile) => {
    setUserProfile(profile);
    setUserData((prev) => ({ ...prev, name: profile?.name || "Citizen" }));
  };

  const logout = () => {
    setUserProfile(null);
    setDigiLockerDocuments(null);
    setExtractedData(null);
    setAnswers(null);
    setUserData({ name: "Citizen", documents: [] });
    localStorage.removeItem("userProfile");
    localStorage.removeItem("digiLockerDocuments");
    localStorage.removeItem("extractedData");
    localStorage.removeItem("answers");
    localStorage.removeItem("userData");
  };

  const updateDigiLockerDocuments = (documents) => {
    setDigiLockerDocuments(documents);
  };

  const updateExtractedData = (data) => {
    setExtractedData(data);
  };

  const updateAnswers = (data) => {
    setAnswers(data);
  };

  const updateLockerData = (newData) => {
    setLockerData(newData);
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        setUserProfile,
        digiLockerDocuments,
        updateDigiLockerDocuments,
        extractedData,
        updateExtractedData,
        answers,
        updateAnswers,
        userData,
        setUserData,
        lockerData,
        updateLockerData,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

