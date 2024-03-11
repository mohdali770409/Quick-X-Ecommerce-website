import {
  FaSearch,
  FaShoppingCart,
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
const Header = () => {
  const user = { _id: "asg", role: "admin" };
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const logoutHandler = () => {
    setIsOpen(false);
  };

  return (
    <nav className="header">
      <Link
        onClick={() => {
          setIsOpen(false);
        }}
        to={"/"}
      >
        Home
      </Link>
      <Link
        onClick={() => {
          setIsOpen(false);
        }}
        to={"/search"}
      >
        <FaSearch />
      </Link>
      <Link
        onClick={() => {
          setIsOpen(false);
        }}
        to={"/cart"}
      >
        <FaShoppingCart />
      </Link>
      {user?._id ? (
        <>
          <button
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
          >
            <FaUser />
          </button>
          <dialog open={isOpen}>
            <div>
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/orders"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Orders
              </Link>
              <button onClick={logoutHandler}>
                <FaSignOutAlt />
              </button>
            </div>
          </dialog>
        </>
      ) : (
        <Link to={"/login"}>
          <FaSignInAlt />{" "}
        </Link>
      )}
    </nav>
  );
};

export default Header;
