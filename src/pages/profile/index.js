import { useState, useEffect } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useLogout from "../../hooks/useLogout";

export default function User() {
  const [user, setUser] = useState(null);
  const [hasError, setHasError] = useState(false);
  const { logOut, loading } = useLogout();
  useEffect(() => {
    const id = localStorage.getItem("currID");
    const loggedin = localStorage.getItem("logged_in");
    if (loggedin !== "true") {
      Router.push("/login");
      return;
    }
    api
      .get(`/users/${id}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error(err);
        setHasError(true);
      });
  }, []);

  if (hasError) {
    return (
      <div>
        <h1>SESSION EXPIRED</h1>
        <p>Please log back in</p>
        <button disabled={loading} onClick={logOut}>
          {loading ? "Logging out..." : "Log out"}
        </button>
      </div>
    );
  }

  if (user === null) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Phone: {user.phone}</p>
      <p>Status: {user.status ? "Active" : "Inactive"}</p>
      <p>Created At: {new Date(user.createdDate).toLocaleString()}</p>
      <p>
        <Link href="/profile/updateinfo">
          <button>Update your information</button>
        </Link>
        <Link href="/profile/updatepw">
          <button>Update your password</button>
        </Link>
      </p>
      <Link href="/home">
        <button>Back to home</button>
      </Link>
      <button disabled={loading} onClick={logOut}>
        {loading ? "Logging out..." : "Log out"}
      </button>
    </div>
  );
}
