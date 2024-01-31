import React, { useState, useEffect, useRef } from 'react';
import ClipboardJS from 'clipboard';

function Uploader(props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const uploadFileRef = useRef(null);

  useEffect(() => {
    new ClipboardJS('.btn');
    if (props.imgpath) {
      window.feather.replace();
    }
  }, [props.imgpath]);

  const handleFileChange = (event) => {
    if (!event.target.files || !event.target.files.length) {
      return;
    }

    const selectedFile = event.target.files[0];

    const metadata = {
      name: selectedFile.name,
      attachmentType: selectedFile.type,
      dateCreated: new Date(),
    };

    const formData = new FormData();
    formData.append('file', selectedFile);
    props.onLoaded({
      formData,
      metadata,
    });
  };

  const handleDelete = () => {
    const formData = createFormData();
    props.onDeleted({
      formData,
    });

    clearUploadFileRef();
  };

  const createFormData = () => {
    const formData = new FormData();
    formData.append('filename', props.imgpath);
    return formData;
  };

  const clearUploadFileRef = () => {
    if (uploadFileRef.current) {
      uploadFileRef.current.value = '';
    }
  };

  const handleCopyUriClick = async () => {
    try {
      await navigator.clipboard.writeText(props.imgpath);
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-12 col-md-9">
          <div className="input-group mt-1">
            <label className="btn-primary p-2" htmlFor={props.id}>
              Examinar
            </label>
            <input
              ref={uploadFileRef}
              id={props.id}
              type="file"
              className="form-control d-none"
              lang="es"
              accept={props.accept}
              onChange={handleFileChange}
            />
            <input
              value={props.imgpath}
              type="text"
              className="form-control"
              placeholder="Seleccione un archivo..."
              readOnly
            />
          </div>
        </div>

        {props.imgpath && props.imgpath.length > 0 && (
          <div className="col-12 col-md-3 d-flex justify-content-around mt-md-0 mt-3">
            {props.enablecopy && (
              <button
                type="button"
                className="btn btn-outline-primary rounded-circle py-2"
                onClick={() => handleCopyUriClick()}
              >
                <i data-feather="copy"></i>
              </button>
            )}
            {props.enablepreview && (
              <button
                className="btn btn-outline-primary rounded-circle py-2"
                type="button"
                onClick={() => setModalOpen(true)}
              >
                <i data-feather="image"></i>
              </button>
            )}
            {props.enabledelete && (
              <button
                className="btn btn-outline-danger rounded-circle py-2"
                type="button"
                onClick={handleDelete}
              >
                <i data-feather="trash-2"></i>
              </button>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div>
          <div className="modal-backdrop fade show"></div>
          <div
            className={`modal fade show d-block img-preview-modal${props.id}`}
            tabIndex="-1"
            aria-labelledby={`imgPreviewModal${props.id}`}
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-light border-2">
                  <h5 className="modal-title" id={`imgPreviewModal${props.id}`}>
                    Vista previa de la imagen
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setModalOpen(false)}
                  ></button>
                </div>
                {props.imgpath && props.imgpath.length > 0 && (
                  <div className="modal-body p-0 bg-light">
                    <img
                      src={props.imgpath || ''}
                      className="img-fluid"
                      alt="Vista previa"
                    />
                  </div>
                )}
                <div className="modal-footer bg-light border-0" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Uploader;
