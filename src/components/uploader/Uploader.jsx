import React, { useState } from 'react';
import UploadButton from './uploadButton/UploadButton.jsx';
import DropZone from './uploadButton/DropZone.jsx';
import Spinner from '@components/spinner/Spinner.jsx';
import FileViewer from '@components/uploader/fileViewer/FileViewer.jsx';

const Uploader = (props) => {
  const {
    file,
    behaviors,
    accept,
    onEvent,
    actions,
    id,
    componentTexts,
    height,
    folder,
    uploadService
  } = props;
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitFile = async (event) => {
    try {
      setIsLoading(true);
      if (!event || !event.formData) {
        return null;
      }

      event.formData.append('folder', folder);
      
      const service = new uploadService();
      const fileUploadedResponse = await service.post(event.formData);

      if (!fileUploadedResponse || !fileUploadedResponse.success) {
        return null;
      }

      return { file: fileUploadedResponse?.result, metadata: event?.metadata };
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="my-1">
      {file?.uri?.length || file?.url?.length ? (
        <FileViewer
          id={id}
          file={{ ...file, uri: file?.uri || file?.url }}
          onEvent={onEvent}
          actions={actions}
          height={height}
        />
      ) : behaviors?.isInline ? (
        <DropZone
          id={id}
          onSubmitFile={onSubmitFile}
          onEvent={onEvent}
          accept={accept}
          componentTexts={componentTexts}
        />
      ) : (
        <UploadButton
          id={id}
          onSubmitFile={onSubmitFile}
          onEvent={onEvent}
          accept={accept}
          componentTexts={componentTexts}
        />
      )}
    </div>
  );
};

export default Uploader;
