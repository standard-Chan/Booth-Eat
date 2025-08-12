import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AppToast() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      limit={3}
      newestOnTop
      style={{ top: "10vh" }} // 상단에서 10vh 내려오기
      toastStyle={{
        width: "auto", // 내용에 맞춰
        height: "70px",
        maxWidth: "90vw", // 너무 길면 화면 폭 제한
        whiteSpace: "nowrap", // 줄바꿈 방지
      }}
    />
  );
}
