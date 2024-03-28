/**
 * SelectizeTags Component
 *
 * @component
 *
 * @prop {Array} data - A list of pre-existing data to display initially. It is required.
 * @prop {Boolean} editMode - Controls whether the user can interact with the input and the list.
 * @prop {String} name - A string to customize the input placeholder.
 * @prop {Function} response - A callback function to send the updated data list to a parent or consumer component.
 *
 * @description
 * The SelectizeTags component offers an interface for users to add or delete multiple data entries (such as tags or emails)
 * and send this data to a parent or consumer component. When data is present, it initializes the component's display list.
 * The editMode prop can disable interactions, turning the component into a read-only display.
 * Each entry displays a clear button next to it, allowing removal unless in editMode.
 *
 */

import React, { useState, useEffect } from 'react';

function SelectizeTags({ data, editMode, name, response }) {
  const [newMessage, setNewMessage] = useState('');
  const [newData, setNewData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      setNewData(data);
    }
  }, [data]);

  useEffect(() => {
    sendData();
  }, [newData]);

  const sendData = () => {
    response(newData);
  };

  const handleMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const addData = () => {
    setNewData([...newData, newMessage]);
    setNewMessage('');
  };

  const deleteData = (index) => {
    const updatedData = [...newData];
    updatedData.splice(index, 1);
    setNewData(updatedData);
  };

  return (
    <>
      <div className="input-group">
        <input
          type="email"
          className="form-control"
          placeholder={`Enter ${name}`}
          value={newMessage}
          disabled={editMode}
          onChange={handleMessageChange}
        />
        <div className="input-group-append">
          <button
            type="button"
            className="btn btn-primary"
            onClick={addData}
            disabled={!newMessage}
          >
            Add {name}
          </button>
        </div>
      </div>
      <div className="d-flex flex-wrap mt-1 justify-content-evenly">
        {newData.map((email, index) => (
          <div className="d-flex" key={index}>
            <div className="badge badge-soft-blue rounded-pill text-dark d-flex align-items-center mt-2">
              {email}
            </div>
            <button type="button" className="btn btn-clear" disabled={editMode}>
              <span
                className="mdi mdi-close"
                onClick={() => deleteData(index)}
              ></span>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default SelectizeTags;
