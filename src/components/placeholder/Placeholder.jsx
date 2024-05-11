import React from 'react';

function Placeholder({ type, children, count, columns = 7 }) {
  const renderDescriptionLines = () => {
    return [...Array(count)].map((_, index) => (
      <div key={index}>
        <span className="placeholder col-5"></span>
      </div>
    ));
  };

  const renderTableLines = () => {
    return [...Array(count)].map((_, index) => (
      <tr key={index} className="placeholder-wave">
        {[...Array(columns)].map((_, tdIndex) => (
          <td key={tdIndex}>
            <span className="placeholder col-12"></span>
          </td>
        ))}
      </tr>
    ));
  };

  const renderTable = () => {
    return (
      <section className="container-fluid">
        <div className="row">
          <div className="col-12">
            <article className="card shadow">
              <section className="card-body">
                <header className="placeholder-wave">{children}</header>
                <section className="table-responsive">
                  <table className="table mb-0">
                    <tbody>{renderTableLines()}</tbody>
                  </table>
                </section>
              </section>
            </article>
          </div>
        </div>
      </section>
    );
  };

  const renderTitleLines = () => {
    return (
      <>
        {[...Array(count)].map((_, index) => (
          <div key={index} className="row">
            <p className="placeholder col-3"></p>
          </div>
        ))}
        <div className="text-muted font-14 mb-3">{children}</div>
      </>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'description':
        return renderDescriptionLines();
      case 'table':
        return renderTable();
      case 'title':
        return renderTitleLines();
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
}

export default Placeholder;
