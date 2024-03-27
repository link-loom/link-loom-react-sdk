import React from "react";

const WebPDocumentRenderer = ({
  mainState: { currentDocument },
}) => {
  if (!currentDocument) return null;

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100%', width: '100%' }}>
      <img className="img-fluid" src={currentDocument.fileData} alt="Document" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
    </div>
  );
};

WebPDocumentRenderer.fileTypes = ["webp", "image/webp"];
WebPDocumentRenderer.weight = 10;

export default WebPDocumentRenderer;