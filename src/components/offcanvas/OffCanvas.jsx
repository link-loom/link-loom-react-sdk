import React, { useEffect, useState } from 'react';

function transformToArray(entity) {
  let objectKeys = Object.keys(entity);

  let arr = objectKeys.map((key) => {
    return {
      key,
      value: JSON.stringify(entity[key]),
    };
  });

  return arr || [];
}

function OffCanvas(props) {
  const [entities, setEntities] = useState([]);

  useEffect(() => {
    setEntities(transformToArray(props.entity));
  }, [props.entity]);

  return (
    <>
      <button
        type="button"
        className={props.className}
        data-bs-toggle="offcanvas"
        data-bs-target={`#${props.id}`}
        aria-controls={props.id}
      >
        <i className={props.icon}></i> {props.content || ''}
      </button>

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id={props.id}
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5 id="offcanvasRightLabel">{props.title}</h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body">
          {entities.map((entity) => (
            <div className="mb-3" key={entity.key}>
              <label className="form-label">{entity.key}</label>
              <input
                type="text"
                className="form-control"
                value={entity.value}
                disabled
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default OffCanvas;
