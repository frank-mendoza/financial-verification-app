import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { AppProvider } from "./context.jsx";

createRoot(document.getElementById("root")).render(
  <ChakraProvider value={defaultSystem}>
    <AppProvider>
      <App />
    </AppProvider>
    <ToastContainer position="top-center" />
  </ChakraProvider>
);
