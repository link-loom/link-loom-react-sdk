import styled from 'styled-components';

const breakpoints = {
  xl: 1199,
  lg: 991,
  md: 767,
  sm: 575,
};

// Default values by preset
const presetSizes = {
  fullscreen: {
    base: '95vw',
    xl: '90vw',
    lg: '85vw',
    md: '80vw',
    sm: '100%',
  },
  default: {
    base: '80vw',
    xl: '75vw',
    lg: '70vw',
    md: '65vw',
    sm: '95vw',
  },
  wide: {
    base: '70vw',
    xl: '65vw',
    lg: '60vw',
    md: '55vw',
    sm: '90vw',
  },
  medium: {
    base: '60vw',
    xl: '55vw',
    lg: '50vw',
    md: '45vw',
    sm: '85vw',
  },
  narrow: {
    base: '50vw',
    xl: '45vw',
    lg: '40vw',
    md: '35vw',
    sm: '80vw',
  },
  compact: {
    base: '40vw',
    xl: '35vw',
    lg: '30vw',
    md: '25vw',
    sm: '75vw',
  },
};

const Container = styled.article`
  width: ${(props) => {
    const { $size, $isPopup, $customSize } = props;

    if (presetSizes[$size]) return presetSizes[$size].base;
    if ($isPopup) return '800px';
    if ($size === 'custom' && $customSize && $customSize.xl) return $customSize.xl;

    return '100%';
  }};

  ${(props) =>
    props.$isPopup || presetSizes[props.$size]
      ? ''
      : 'flex-grow: 1;'};

  @media (max-width: ${breakpoints.xl}px) {
    width: ${(props) => {
      const { $size, $isPopup, $customSize } = props;

      if (presetSizes[$size]) return presetSizes[$size].xl;
      if ($isPopup) return '700px';
      if ($size === 'custom' && $customSize && $customSize.xl) return $customSize.xl;

      return '100%';
    }};
  }

  @media (max-width: ${breakpoints.lg}px) {
    width: ${(props) => {
      const { $size, $isPopup, $customSize } = props;

      if (presetSizes[$size]) return presetSizes[$size].lg;
      if ($isPopup) return '600px';
      if ($size === 'custom' && $customSize && $customSize.lg) return $customSize.lg;

      return '100%';
    }};
  }

  @media (max-width: ${breakpoints.md}px) {
    width: ${(props) => {
      const { $size, $isPopup, $customSize } = props;

      if (presetSizes[$size]) return presetSizes[$size].md;
      if ($isPopup) return '500px';
      if ($size === 'custom' && $customSize && $customSize.md) return $customSize.md;

      return '100%';
    }};
  }

  @media (max-width: ${breakpoints.sm}px) {
    width: ${(props) => {
      const { $size, $isPopup, $customSize } = props;

      if (presetSizes[$size]) return presetSizes[$size].sm;
      if ($isPopup) return '95vw';
      if ($size === 'custom' && $customSize && $customSize.sm) return $customSize.sm;

      return '100%';
    }};
    min-width: ${(props) => {
      const { $size, $isPopup } = props;

      if (presetSizes[$size]) return presetSizes[$size].sm;
      if ($isPopup) return '95vw';

      return '100%';
    }};
  }
`;

export default Container;
