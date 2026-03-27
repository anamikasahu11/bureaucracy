import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";

import Rejection from "./pages/rejection";
import GovGuruAssistant from "./components/GovGuruAssistant";
import UploadDocs from "./UploadDocs";
import ValidateDocs from "./ValidateDocs";
import { UserContext } from "./UserContext";
import "./App.css";

function Home() {
  return (
    <main className="app-main">
      <section className="home-card">
        <h1>Bureaucracy Navigator</h1>
        <p>
          Manage your document locker, run rejection risk checks, and get help from Gov Guru
          Assistant in one place.
        </p>
      </section>
    </main>
  );
}

function LockerHub() {
  return (
    <main className="app-main">
      <section className="home-card">
        <h2>Document Locker</h2>
        <p>Add documents and validate whether they are active or expired.</p>
      </section>

      <section className="section">
        <h2>Upload Documents</h2>
        <UploadDocs />
      </section>

      <section className="section">
        <ValidateDocs />
      </section>
    </main>
  );
}

function App() {
  const [documents, setDocuments] = useState({});
  const [userData, setUserData] = useState({
    name: "Citizen",
    documents: [],
  });

  return (
    <BrowserRouter>
      <UserContext.Provider value={{ userData, setUserData }}>
        <header className="app-header">
          <nav className="app-nav" aria-label="Main navigation">
            <NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/">
              Home
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              to="/locker"
            >
              Locker
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              to="/rejection"
            >
              Rejection Engine
            </NavLink>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locker" element={<LockerHub />} />
          <Route
            path="/rejection"
            element={<Rejection documents={documents} setDocuments={setDocuments} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GovGuruAssistant />

        <footer className="app-footer">Built for faster citizen service workflows.</footer>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;