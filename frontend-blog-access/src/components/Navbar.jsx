import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          Dev<span>Blog</span>.
        </Link>

        <div className={styles.links}>
          {user ? (
            <div className={styles.userSection}>
              <span className={styles.greeting}>
                Hello,{" "}
                <span className={styles.username}>
                  {user.username || user.email}
                </span>
              </span>
              <small>
                <button onClick={logout} className={styles.btnLogout}>
                  Log out
                </button>
              </small>
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.btnLogin}>
                Log in
              </Link>
              <Link to="/signup" className={styles.btnSignup}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
