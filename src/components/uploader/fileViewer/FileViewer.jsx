import React, { useState, useEffect } from 'react';
import { Card, CardActions, Button, CardHeader, CardContent } from '@mui/material';
import DocumentViewerComponent from '@components/document-viewer/DocumentViewer.jsx';
import DocumentActionMenu from '@components/uploader/documents/DocumentActionMenu.jsx';
import { useSnackbar } from '@components/snackbar/Snackbar.jsx';

const defaultActions = [
  {
    title: 'Copy',
    action: 'copy',
    disabled: false,
  },
  {
    title: 'View',
    action: 'view',
    disabled: false,
  },
  {
    title: 'Delete',
    action: 'delete',
    disabled: false,
  },
];

const FileViewer = ({ id, file, onEvent, actions = defaultActions, height, fileViewerConfig }) => {
  const { openSnackbar } = useSnackbar();
  const [footerButtons, setFooterButtons] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const enabledActions = actions.filter((action) => !action.disabled);
    setFooterButtons(enabledActions.slice(0, 2));
    setMenuItems(enabledActions.slice(2));
  }, [actions]);

  const handleClipboardCopy = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      openSnackbar(message, 'success');
    } catch (err) {
      openSnackbar('Error copying the link!', 'error');
    }
  };

  const handleViewDocument = (file) => {
    window.open(file.uri, '_blank', 'noreferrer');
  };

  const internalItemOnAction = (action, file) => {
    switch (action) {
      case 'view':
        handleViewDocument(file);
        break;
      case 'copy':
        handleClipboardCopy(file.uri, 'Link copied!');
        break;
      default:
        if (onEvent) onEvent(action, file);
        break;
    }
  };

  return (
    <Card id={id} className="shadow-none border">
      {!fileViewerConfig?.isPreview && (
        <>
          <CardHeader
            className="d-flex flex-wrap-nowrap overflow-hidden"
            title={<div className="text-truncate">{file.documentname}</div>}
            subheader={
              <div className="text-truncate">
                {`${
                  file.filename.length >= 20 ? file.filename.slice(0, 20) + '...' : file.filename
                }, ${file.dateCreated}`}
              </div>
            }
          />
        </>
      )}
      <CardContent>
        {file.uri && (
          <DocumentViewerComponent files={[{ uri: file.uri }]} height={height || '600px'} />
        )}
      </CardContent>
      {!fileViewerConfig?.isPreview && (
        <CardActions>
          {footerButtons.map(({ title, action }) => (
            <Button key={title} onClick={() => internalItemOnAction(action, file)}>
              {title}
            </Button>
          ))}
          <DocumentActionMenu
            actions={menuItems}
            itemOnAction={(action) => internalItemOnAction(action, file)}
          />
        </CardActions>
      )}
    </Card>
  );
};

export default FileViewer;
