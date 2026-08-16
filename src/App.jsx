import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { ClerkProvider } from "@clerk/clerk-react";
import { Clerk } from "@clerk/clerk-js";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import UserDocSync from "@/components/UserDocSync";
import { ThemeProvider } from "@/context/ThemeContext";
import { CurrencyProvider } from "@/context/CurrencyContext";

import "react-toastify/dist/ReactToastify.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} Clerk={Clerk}>
      <ThemeProvider>
        <CurrencyProvider>
          <UserDocSync />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Router>
            <Routes>
              <Route path="/" element={<Signup />} />
              <Route path="/sign-in" element={<Signup />} />
              <Route path="/sign-up" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Router>
        </CurrencyProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;