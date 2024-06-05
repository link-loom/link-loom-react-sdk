import React from 'react';

const SnapData = (props) => {
  const { id, data, onEdit, emptyText } = props;

  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(data);
    }
  };

  const editOnClick = () => {
    onEdit(id);
  };

  return (
    <div className="d-flex">
      {data ? (
        <>
          <span>{data}</span>
          <div className="ms-1">
            <button className="btn btn-link py-0 px-1" onClick={handleCopy}>
              <i className="fe-copy"></i>
            </button>
          </div>
        </>
      ) : (
        <>
          <span>{emptyText ? emptyText : 'N/A'}</span>
          <div className="ms-1">
            <button className="btn btn-link py-0 px-1" onClick={editOnClick}>
              <i className="fe-edit"></i>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SnapData;
