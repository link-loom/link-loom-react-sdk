import styled from 'styled-components';

const Container = styled.article`
  width: ${(props) => {
    if (props.$size === 'fullscreen') return '95vw';
    if (props.$size === 'default') return '80vw';
    if (props.$isPopup) return '800px';
    return '100%'; // Compact by default
  }};
  ${(props) =>
    props.$isPopup || props.$size === 'default' || props.$size === 'fullscreen'
      ? ''
      : 'flex-grow: 1;'};

  @media (max-width: 1199px) {
    width: ${(props) => {
      if (props.$size === 'fullscreen') return '90vw';
      if (props.$size === 'default') return '75vw';
      if (props.$isPopup) return '700px';
      return '100%';
    }};
  }

  @media (max-width: 991px) {
    width: ${(props) => {
      if (props.$size === 'fullscreen') return '85vw';
      if (props.$size === 'default') return '70vw';
      if (props.$isPopup) return '600px';
      return '100%';
    }};
  }

  @media (max-width: 767px) {
    width: ${(props) => {
      if (props.$size === 'fullscreen') return '80vw';
      if (props.$size === 'default') return '65vw';
      if (props.$isPopup) return '500px';
      return '100%';
    }};
  }

  @media (max-width: 575px) {
    width: ${(props) => {
      if (props.$size === 'fullscreen') return '100%';
      if (props.$size === 'default') return '95vw';
      if (props.$isPopup) return '95vw';
      return '100%';
    }};
    min-width: ${(props) => {
      if (props.$size === 'fullscreen' || props.$size === 'default') return '95vw';
      if (props.$isPopup) return '95vw';
      return '100%';
    }};
  }
`;

export default Container;
