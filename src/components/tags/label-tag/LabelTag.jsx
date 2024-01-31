import React, { useRef, useEffect } from 'react';
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';

const LabelTags = ({ onChange, value }) => {
  const inputRef = useRef(null);
  const tagifyRef = useRef(null);

  useEffect(() => {
    if (!tagifyRef.current) {
      tagifyRef.current = new Tagify(inputRef.current);

      tagifyRef.current.on('change', (e) => {
        if (onChange && e.detail.value !== value) {
          onChange(e.detail.value);
        }
      });
    }

    return () => {
      if (tagifyRef.current) {
        tagifyRef.current.destroy();
        tagifyRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (tagifyRef.current && tagifyRef.current.value !== value) {
      tagifyRef.current.removeAllTags();
      tagifyRef.current.addTags(value);
    }
  }, [value]);

  return <input ref={inputRef} className="form-control" />;
};

export default LabelTags;
