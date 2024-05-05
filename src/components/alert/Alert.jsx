import { useEffect, useCallback } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Alert({ config, setConfirm }) {
  const {
    typeIcon,
    title,
    description,
    confirmButtonText,
    cancelButtonText,
    cancelButtonClass,
    confirmButtonClass,
    showCancelButton,
  } = config;

  const handleAlert = useCallback(() => {
    const swalWithBootstrapButtons = MySwal.mixin({
      customClass: {
        confirmButton: confirmButtonClass || 'btn btn-success',
        cancelButton: cancelButtonClass || 'btn btn-danger',
      },
      buttonsStyling: false,
      allowOutsideClick: () => !showCancelButton,
    });

    if (!showCancelButton) {
      MySwal.fire(title, description, typeIcon);
      setConfirm(false);
      return;
    }

    swalWithBootstrapButtons
      .fire({
        title: title,
        text: description,
        icon: typeIcon,
        showCancelButton: showCancelButton,
        confirmButtonText: confirmButtonText || 'Confirm',
        cancelButtonText: cancelButtonText || 'Cancel',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          setConfirm(true);
        } else if (result.dismiss === MySwal.DismissReason.cancel) {
          setConfirm(false);
        }
      });
  }, [
    typeIcon,
    title,
    description,
    confirmButtonText,
    cancelButtonText,
    cancelButtonClass,
    showCancelButton,
    setConfirm,
  ]);

  useEffect(() => {
    handleAlert();
  }, [handleAlert]);

  return null;
}

export default Alert;
