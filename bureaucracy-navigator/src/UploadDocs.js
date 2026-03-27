import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

function UploadDocs() {
  const { userData, setUserData } = useContext(UserContext);
  const [docName, setDocName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleNameChange = (e) => {
    setDocName(e.target.value);
  };

  const handleExpiryChange = (e) => {
    setExpiryDate(e.target.value);
  };

  const handleAddDocument = () => {
    if (docName && expiryDate) {
      if (userData.documents.some(doc => doc.name === docName)) {
        alert("Document with this name already exists.");
        return;
      }
      const newDoc = {
        name: docName,
        expiryDate: expiryDate,
      };
      setUserData({
        ...userData,
        documents: [...userData.documents, newDoc],
      });
      setDocName("");
      setExpiryDate("");
    }
  };

  const handleDelete = (index) => {
    setUserData({
      ...userData,
      documents: userData.documents.filter((_, i) => i !== index),
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="upload-section">
      <input type="text" value={docName} onChange={handleNameChange} placeholder="Document Name" />
      <input type="date" value={expiryDate} onChange={handleExpiryChange} placeholder="Expiry Date" />
      <button onClick={handleAddDocument}>Add Document</button>

      <ul className="locker-doc-listing">
        {userData.documents.length === 0 ? (
          <li>No documents added yet.</li>
        ) : (
          userData.documents.map((doc, index) => (
            <li key={index}>
              {doc.name} - Expires: {formatDate(doc.expiryDate)}
              <button onClick={() => handleDelete(index)}>Delete</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default UploadDocs;
