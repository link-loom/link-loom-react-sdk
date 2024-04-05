import React from 'react';

class OnPageLoaded extends React.Component {
  componentDidMount() {
    var event = new Event('page-loaded');
    window.dispatchEvent(event);
  }

  render() {
    return null;
  }
}

export default OnPageLoaded;
