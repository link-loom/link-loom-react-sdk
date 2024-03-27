import React, { useState } from 'react';
import UploadButton from './uploadButton/UploadButton';
import DropZone from './uploadButton/DropZone';
import Loader from '@components/shared/loaders/spinner/SpinnerLoader';
import FileViewer from '@components/shared/uploader/fileViewer/FileViewer';
import { UploadService } from '@services';

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
  } = props;
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitFile = async (event) => {
    try {
      setIsLoading(true);
      if (!event || !event.formData) {
        return null;
      }

      event.formData.append('folder', folder);
      
      const uploadService = new UploadService();
      const fileUploadedResponse = await uploadService.post(event.formData);

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
    <Loader />
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
