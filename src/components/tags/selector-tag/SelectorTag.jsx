/**
 * SelectorTag Component
 * 
 * @component
 * 
 * @prop {Array} tagOptions - A list of selectable tags located at the bottom of the component is is require.
 * @prop {Boolean} isEditable - Controls whether the tags in the list are interactive.
                              By default, it's false, meaning the tags are selectable.
 * @prop {Array} presetTags - A list of initially selected tags when the component mounts is Optional.
 * 
 * @description
 * The SelectorTag component provides an interactive interface to select and view tags from a given list.
 * It uses Bootstrap classes to style the tags and their container.
 * Selected tags are displayed with a blue background (bg-primary), while unselected tags have a gray background (bg-secondary).
 * If isEditable is true, clicking on an unselected tag adds it to the list of selected tags.
 * Selected tags display an "x" next to them, and clicking on them removes them from the list of selected tags.
*/

import React, { useState, useEffect, useCallback } from 'react';

const SelectorTag = React.memo(
  ({ tagOptions = ['No data'], isEditable = false, presetTags = [], onTagsChange }) => {
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
      setSelectedItems(presetTags);
    }, [presetTags]);

    const handleTagClick = useCallback(
      (item) => {
        if (!isEditable && !selectedItems.includes(item)) {
          setSelectedItems((prevState) => {
            const newSelectedItems = [...prevState, item];
            onTagsChange && onTagsChange(newSelectedItems);
            return newSelectedItems;
          });
        }
      },
      [isEditable, selectedItems, onTagsChange],
    );

    const handleRemoveSelectedItem = useCallback(
      (item) => {
        if (!isEditable) {
          setSelectedItems((prevState) => {
            const newSelectedItems = prevState.filter((i) => i !== item);
            onTagsChange && onTagsChange(newSelectedItems);
            return newSelectedItems;
          });
        }
      },
      [isEditable, onTagsChange],
    );

    return (
      <section>
        <div
          className={`mb-1 border rounded p-2 d-flex align-items-center flex-wrap overflow-auto py-1 ${
            presetTags.length ? 'py-1' : 'py-3'
          }`}
        >
          {selectedItems.map((item) => (
            <div
              role="button"
              key={item}
              className="badge bg-primary m-1 fs-5"
              onClick={() => handleRemoveSelectedItem(item)}
            >
              {item} {!isEditable && <span className="text-white-50">x</span>}
            </div>
          ))}
        </div>
        {!isEditable && (
          <div className="mb-2">
            {tagOptions.map((item) => (
              <span
                role="button"
                key={item}
                className={`badge m-1 fs-6 ${
                  selectedItems.includes(item) ? 'bg-light text-dark' : 'bg-secondary'
                }`}
                onClick={() => handleTagClick(item)}
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </section>
    );
  },
);

export default SelectorTag;
