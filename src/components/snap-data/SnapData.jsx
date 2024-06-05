import React, { useState } from 'react';

const SnapData = ({ id, data, onEdit, emptyText, alignment }) => {
  const [copied, setCopied] = useState(false);

  const copyOnClick = () => {
    if (data) {
      navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const editOnClick = () => {
    onEdit(id);
  };

  const justifyClasses = {
    left: 'w-100 justify-content-start',
    center: 'w-100 justify-content-center',
    right: 'w-100 justify-content-end',
  };

  const alignmentClass = justifyClasses[alignment];

  return (
    <div className={`d-flex align-items-center ${alignmentClass}`}>
      {data ? (
        copied ? (
          <div>
            <span>{data}</span>
            <div className="ms-1">
              <button className="btn btn-link py-0 px-1" onClick={copyOnClick}>
                <i className="fe-copy"></i>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <span>Copied!</span>
            <div className="ms-1">
              <button className="btn btn-link py-0 px-1">
                <i className="fe-check"></i>
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          <span>{emptyText || 'N/A'}</span>
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
