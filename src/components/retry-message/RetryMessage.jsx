import React from 'react';

function RetryMessage(props) {
  const { message, buttonMessage, onRetryClick } = props;
  const defaultMessage = 'Information is not available right now.';
  const defaultButtonMessage = 'Click here to retry';

  return (
    <section className="d-flex flex-column justify-content-center mx-auto text-center">
      <h4 className="mb-3 text-body">{message ?? defaultMessage}</h4>
      <button className="btn btn-soft-success mx-auto" onClick={onRetryClick}>
        {buttonMessage ?? defaultButtonMessage}
      </button>
    </section>
  );
}

export default RetryMessage;
