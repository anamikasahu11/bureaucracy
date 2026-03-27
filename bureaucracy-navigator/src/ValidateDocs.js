import { useContext } from "react";
import { UserContext } from "./UserContext";

function ValidateDocs() {
  const { userData } = useContext(UserContext);

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="validate-section">
      <h3>Document Status:</h3>
      {userData.documents.length === 0 ? (
        <p>Add documents in the upload section to see status here.</p>
      ) : (
        <ul>
          {userData.documents.map((doc, index) => (
            <li key={index}>
              {doc.name}:{" "}
              <span className={isExpired(doc.expiryDate) ? "expired" : "valid"}>
                {isExpired(doc.expiryDate) ? "Expired" : "Valid"}
              </span>
              (Expires: {formatDate(doc.expiryDate)})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ValidateDocs;
