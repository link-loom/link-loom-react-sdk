import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import PropTypes from 'prop-types';

const VirtualList = forwardRef(({
    data,
    renderItem,
    style = { height: '100%', width: '100%' },
    ...props
}, ref) => {
    const virtuosoRef = useRef(null);

    useImperativeHandle(ref, () => ({
        scrollToIndex: (index) => virtuosoRef.current?.scrollToIndex(index),
        scrollToBottom: () => virtuosoRef.current?.scrollToIndex({ index: data.length - 1, behavior: 'smooth' }),
        // Allow access to other methods if needed
        virtuoso: virtuosoRef.current
    }));

    // Simple adapter to match Virtuoso's itemContent signature (index, data)
    // to our RenderItem signature (item, index)
    const itemContent = (index, item) => {
        return renderItem(item, index);
    };

    return (
        <Virtuoso
            ref={virtuosoRef}
            style={style}
            data={data}
            itemContent={itemContent}
            {...props}
        />
    );
});

VirtualList.propTypes = {
    data: PropTypes.array.isRequired,
    renderItem: PropTypes.func.isRequired,
    style: PropTypes.object,
};

VirtualList.displayName = 'VirtualList';

export default VirtualList;
