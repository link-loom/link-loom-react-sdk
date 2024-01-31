import React from 'react';

function Spinner() {
  return (
    <div className="d-flex justify-content-center">
      <div className="spinner-border m-2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

export default Spinner;
