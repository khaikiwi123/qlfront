import { useState, useEffect } from "react";
import api from "../../../api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useLogout from "../../../hooks/useLogout";
import useCheckLogin from "../../../hooks/useCheckLogin";

export default function client() {
  const [client, setclient] = useState(null);
  const [loadingDelete, setDelete] = useState(false);
  const [loadingStatus, setStatus] = useState(false);

  const router = useRouter();
  const id = router.query.id;
  useCheckLogin();
  useEffect(() => {
    api
      .get(`/clients/${id}`)
      .then((response) => {
        setclient(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);
  const onDelete = async (id) => {
    setDelete(true);
    await api.delete(`/clients/${id}`);

    router.push("/clients/potential");

    setDelete(false);
  };
  const onUpdate = async (id) => {
    setStatus((prevState) => ({ ...prevState, [id]: true }));

    try {
      const currentStatus = client.status;
      await api.put(`/clients/${id}`, { status: !currentStatus });
      setclient({ ...client, status: !currentStatus });
    } catch (error) {
      console.error(error);
    }

    setStatus((prevState) => ({ ...prevState, [id]: false }));
  };
  const { logOut, loading } = useLogout();

  if (client === null) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {client.email}</p>
      <p>Phone: {client.phone}</p>
      <p>Unit: {client.unit}</p>
      <p>Representer: {client.represent}</p>
      <p>
        Status:
        <button onClick={() => onUpdate(id)} disabled={loadingStatus[id]}>
          {loadingStatus[id]
            ? "Loading..."
            : client.status
            ? "Đã kí kết"
            : "Đang chăm sóc"}
        </button>
      </p>
      <p>Created At: {new Date(client.createdDate).toLocaleString()}</p>
      <p>
        <Link href={`/clients/${id}/updateinfo`}>
          <button>Update client&apos;s information</button>
        </Link>
        <button disabled={loadingDelete} onClick={() => onDelete(id)}>
          {loadingDelete ? "Deleting..." : "Delete"}
        </button>
      </p>
      <Link href="/clients/potential">
        <button>Back to potential clients list</button>
      </Link>
      <Link href="/clients/acquired">
        <button>Back to acquired clients list</button>
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
