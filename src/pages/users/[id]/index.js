import { useState, useEffect } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useLogout from "../../../hooks/useLogout";

export default function User() {
  const [user, setUser] = useState(null);
  const [loadingDelete, setDelete] = useState(false);
  const [currID, setCurr] = useState("");
  const { logOut, loading } = useLogout();

  const router = useRouter();
  const id = router.query.id;

  useEffect(() => {
    setCurr(localStorage.getItem("currID"));

    const loggedin = localStorage.getItem("logged_in");
    if (loggedin !== "true") {
      router.push("/login");
      return;
    }
    api
      .get(`/users/${id}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id, router]);
  const onDelete = async (id) => {
    setDelete(true);
    const response = await api.delete(`/users/${id}`);
    console.log(response);

    router.push("/users/");

    setDelete(false);
  };

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
      <p>Created At: {new Date(user.createdDate).toLocaleString()}</p>
      <p>Status: {user.status ? "Active" : "Inactive"}</p>
      <p>
        <Link href={`/users/${id}/updateinfo`}>
          <button>Update user&apos;s information</button>
        </Link>
        <Link href={`/users/${id}/updatepw`}>
          <button>Update user&apos;s password</button>
        </Link>
        {id !== currID && (
          <button disabled={loadingDelete} onClick={() => onDelete(id)}>
            {loadingDelete ? "Deleting..." : "Delete"}
          </button>
        )}
      </p>
      <Link href="/users">
        <button>Back to users list</button>
      </Link>
      <Link href="/home">
        <button>Back to home</button>
      </Link>
      <button disabled={loading} onClick={logOut}>
        {loading ? "Logging out..." : "Log out"}
      </button>
    </div>
  );
}
