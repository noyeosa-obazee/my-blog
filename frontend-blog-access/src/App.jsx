import { Routes, Route, Outlet, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";

const Layout = () => {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
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
        © 2026 DevBlog. Built with React, Node & Prisma.
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="posts/:id" element={<PostDetail />} />
            {/* <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} /> */}

            {/* Future Idea: Protected Routes (e.g., Admin Dashboard) 
            You would wrap these in a <RequireAuth> component later.
          */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
