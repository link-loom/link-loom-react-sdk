import React from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

const DocumentViewer = ({ url, fileType }) => {
  const docs = [{ uri: url, fileType: fileType }];

  return <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />;
};

export default DocumentViewer;
