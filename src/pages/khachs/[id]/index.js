import { useState, useEffect } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useLogout from "../../../hooks/useLogout";
import useCheckLogin from "../../../hooks/useCheckLogin";

export default function Khach() {
  const [khach, setKhach] = useState(null);
  const [loadingDelete, setDelete] = useState(false);

  const router = useRouter();
  const id = router.query.id;
  useCheckLogin();
  useEffect(() => {
    api
      .get(`/khachs/${id}`)
      .then((response) => {
        setKhach(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);
  const onDelete = async (id) => {
    setDelete(true);
    await api.delete(`/khachs/${id}`);

    router.push("/khachs/");

    setDelete(false);
  };

  const { logOut, loading } = useLogout();

  if (khach === null) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {khach.name}</p>
      <p>Email: {khach.phone}</p>
      <p>Role: {khach.address}</p>
      <p>Status: {khach.status ? "True" : "False"}</p>
      <p>Created At: {new Date(khach.createdDate).toLocaleString()}</p>
      <p>
        <Link href={`/khachs/${id}/updateinfo`}>
          <button>Update khach&apos;s information</button>
        </Link>
        <button disabled={loadingDelete} onClick={() => onDelete(id)}>
          {loadingDelete ? "Deleting..." : "Delete"}
        </button>
      </p>
      <Link href="/khachs">
        <button>Back to customers list</button>
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
