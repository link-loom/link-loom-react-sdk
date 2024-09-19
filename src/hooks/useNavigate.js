import { useNavigate as reactRouterUseNavigate } from 'react-router-dom';

const useNavigate = () => {
  const navigate = reactRouterUseNavigate();

  const customNavigate = (url, options = {}) => {
    const { newTab = false } = options;

    if (newTab) {
      window.open(url, '_blank');
    } else {
      navigate(url);
    }
  };

  return customNavigate;
};

export default useNavigate;
