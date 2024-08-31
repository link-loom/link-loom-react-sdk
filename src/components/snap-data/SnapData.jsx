import React, { useState } from 'react';

function SnapData(props) {
  const { id, data, onEdit, emptyText, alignment, variant, className, icon } = props;
  const [copied, setCopied] = useState(false);

  const copyOnClick = () => {
    if (data) {
      navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  const editOnClick = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const justifyClasses = {
    left: 'justify-content-start',
    center: 'justify-content-center',
    right: 'justify-content-end',
    between: 'justify-content-between',
  };

  const alignmentClass = justifyClasses[alignment];

  const renderData = () => {
    const combinedClassName = `text-truncate ${className || ''}`.trim();

    switch (variant) {
      case 'small':
        return <small className={combinedClassName}>{data}</small>;
      case 'strong':
        return <strong className={combinedClassName}>{data}</strong>;
      default:
        return <span className={combinedClassName}>{data}</span>;
    }
  };

  return (
    <>
      {data ? (
        !copied ? (
          <section className={`d-flex align-items-center ${alignmentClass ? alignmentClass : ''}`}>
            {renderData()}
            <div className="ms-1">
              <button className={`${icon?.className || 'btn btn-link py-0 px-1'}`} onClick={copyOnClick}>
                <i className="fe-copy"></i>
              </button>
            </div>
          </section>
        ) : (
          <section className={`d-flex align-items-center ${alignmentClass ? alignmentClass : ''}`}>
            <span>Copied!</span>
            <div className="ms-1">
              <button className={`${icon?.className || 'btn btn-link py-0 px-1'}`}>
                <i className="fe-check"></i>
              </button>
            </div>
          </section>
        )
      ) : (
        <section className={`d-flex align-items-center ${alignmentClass ? alignmentClass : ''}`}>
          <span>{emptyText || 'N/A'}</span>
          <div className="ms-1">
            <button className={`${icon?.className || 'btn btn-link py-0 px-1'}`} onClick={editOnClick}>
              <i className="fe-edit"></i>
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export default SnapData;
