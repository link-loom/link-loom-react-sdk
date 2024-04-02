import React from 'react';
import styled from 'styled-components';
import DocViewer from '@cyntler/react-doc-viewer';
import { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import useMediaQuery from '@mui/material/useMediaQuery';
import WebPDocumentRenderer from './WebPDocumentRenderer.jsx';

const ThumbnailContainer = styled.div`
  #react-doc-viewer {
    #pdf-controls {
      display: none;
    }
    #image-renderer img, #proxy-renderer {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }

  height: ${props => props.height || 'auto'};
`;

const DocumentViewer = ({ files, height }) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  return (
    <ThumbnailContainer height={height}>
      <DocViewer
        prefetchMethod="GET" // Mandatory property to avoid CORS-related issues
        documents={files}
        config={{
          header: {
            disableHeader: true,
            disabledocumentName: true,
          },
          pdfZoom: {
            defaultZoom: isMobile ? 1.5 : 0.65,
            zoomJump: 0.2,
          },
          pdfVerticalScrollByDefault: true,
        }}
        pluginRenderers={[WebPDocumentRenderer, ...DocViewerRenderers]}
      />
    </ThumbnailContainer>
  );
};

export default DocumentViewer;
