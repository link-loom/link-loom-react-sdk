import React, { useState } from 'react';
import { Button } from '@mui/material';
import styled from 'styled-components';

const DragZoneContainer = styled.div`
  border-style: dashed;
`;

const StyledSpan = styled.span`
  cursor: pointer;
`;

const DropZone = (props) => {
  const { onSubmitFile, onEvent, accept, id, componentTexts } = props;
  const [file, setFile] = useState(null);

  const handleDragOver = (event) => {
    if (event) {
      event.preventDefault();
    }
  };

  const handleFileDrop = (event) => {
    if (event) {
      event.preventDefault();
    }

    const files = event?.dataTransfer?.files;

    if (files?.length) {
      setFile(files[0]);
    }
  };

  const handleFileSelect = (event) => {
    setFile(event.target?.files?.[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const createFormData = (name, value) => {
    const formData = new FormData();
    formData.append(name, value);
    return formData;
  };

  const submitFile = async (event) => {
    if (!file) {
      return;
    }

    const metadata = {
      name: file.name,
      attachmentType: file.type,
      dateCreated: new Date(),
    };

    const formData = createFormData('file', file);
    const fileResponse = await onSubmitFile({ formData, metadata });

    onEvent('onFileLoaded', fileResponse);
  };

  return (
    <DragZoneContainer
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
      className="text-center p-3 border-1"
    >
      {file ? (
        <p>
          {`${componentTexts?.file || 'File'}: ${file.name}`}
          <StyledSpan onClick={handleRemoveFile} className="text-primary ms-1">
            {`${componentTexts?.delete || 'Delete'}`}
          </StyledSpan>
        </p>
      ) : (
        <p className="fs-4 mb-1">
          {`${
            componentTexts?.description ||
            'Drag and drop a file here or select a file'
          } `}
        </p>
      )}
      {file ? (
        <Button
          variant="contained"
          id="uploader"
          component="label"
          onClick={submitFile}
        >
          {`${componentTexts?.buttonUpload || 'Upload'}`}
        </Button>
      ) : (
        <div className="d-flex flex-column align-items-center gap-1">
          <span className="ms-3 text-muted mb-2">
            {`(${
              componentTexts?.fileAccepted || 'File accepted'
            }: ${accept} - ${
              componentTexts?.maxFileSize || 'Max file size'
            }:  ${componentTexts?.fileSize || '5Mb'})`}
          </span>
          <Button variant="contained" component="label">
            {`${componentTexts?.buttonSelectFile || 'Select file'}`}
            <input
              id={id}
              type="file"
              hidden
              onChange={handleFileSelect}
              accept={accept}
            />
          </Button>
        </div>
      )}
    </DragZoneContainer>
  );
};

export default DropZone;
