import {
  Routes,
  Route,
  Outlet,
  BrowserRouter,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const Layout = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "2rem",
          color: "#94a3b8",
          fontSize: "0.9rem",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        © 2026 DevBlog.
      </footer>
    </>
  );
};

function App() {
  return (
    <div className="centered-container">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="posts/:id" element={<PostDetail />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
