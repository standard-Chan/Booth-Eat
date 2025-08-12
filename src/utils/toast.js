import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 공통 토스트 함수
export const showSuccessToast = (message) => {
  toast.success(message, {
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
