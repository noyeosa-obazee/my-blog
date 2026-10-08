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
import CreatePost from "./pages/PostCreate";

const Layout = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="site-footer">© 2026 DevBlog.</footer>
    </div>
  );
};

function App() {
  return (
    <div className="app-shell">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="posts/:id" element={<PostDetail />} />

              <Route path="create" element={<CreatePost />} />

              <Route path="edit/:id" element={<CreatePost />} />
            </Route>
            <Route path="login" element={<Login />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
