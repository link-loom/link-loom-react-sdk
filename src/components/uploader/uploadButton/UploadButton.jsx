import React, { useState } from 'react';
import { Button } from '@mui/material';
import { PopUp } from '@components/shared/popup/PopUp';
import DropZone from '@components/shared/uploader/uploadButton/DropZone';

const UploadButton = (props) => {
  const { onSubmitFile, onEvent, accept, id, componentTexts } = props;
  const [isOpenViewModal, setIsOpenViewModal] = useState(false);

  const itemOnAction = (action, entity) => {
    switch (action) {
      case 'view':
        setIsOpenViewModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="my-1 d-flex align-items-center justify-content-between border border-1 p-2">
        <section className="d-flex align-items-center w-50">
          <i className="mdi mdi-cloud-upload display-3" />
          <span className="ms-3 text-muted">
            {`(${
              componentTexts?.fileAccepted || 'File accepted'
            }: ${accept} - ${componentTexts?.maxFileSize || 'Max file size'}: ${
              componentTexts?.fileSize
            })`}
          </span>
        </section>
        <section>
          <Button
            variant="contained"
            component="label"
            onClick={() => itemOnAction('view')}
          >
            {`${componentTexts?.uploadFile || 'Upload file'}`}
          </Button>
        </section>
      </div>
      <PopUp
        title=""
        data-testid="block-user-modal"
        id="block-user-modal"
        isOpen={isOpenViewModal}
        setIsOpen={setIsOpenViewModal}
      >
        <>
          <DropZone
            id={id}
            onSubmitFile={onSubmitFile}
            onEvent={onEvent}
            accept={accept}
            componentTexts={componentTexts}
          />
        </>
      </PopUp>
    </>
  );
};

export default UploadButton;
