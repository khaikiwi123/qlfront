import { useState, useRef, useEffect } from "react";
import api from "../../api/api";
import Link from "next/link";
import Router from "next/router";
import useCheckLogin from "../../hooks/useCheckLogin";
import { TroubleshootOutlined } from "@mui/icons-material";

const Create = () => {
  const errRef = useRef();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [represent, setRep] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");
  useEffect(() => {
    setId(localStorage.getItem("currID"));
  });
  useCheckLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(TroubleshootOutlined);
    try {
      await api.post(`/clients`, {
        email,
        phone,
        unit,
        represent,
        createdBy: id,
      });
      Router.push("/clients/potential");
    } catch (error) {
      console.error(error);
      setErrMsg(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <h1>Create client</h1>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            placeholder="Representer"
            value={represent}
            onChange={(e) => setRep(e.target.value)}
          />
          <input
            placeholder="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <button disabled={loading} type="submit">
            {loading ? "Creating..." : "Create"}
          </button>
          <Link href="/clients/potential">
            <button>Back to potential client list</button>
          </Link>
        </form>
      </div>
    </>
  );
};

export default Create;
