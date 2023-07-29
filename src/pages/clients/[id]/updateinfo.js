import { useState } from "react";
import api from "@/api/api";
import Link from "next/link";
import { useRouter } from "next/router";
import useCheckLogin from "@/hooks/useCheckLogin";
import TextField from "@mui/material/TextField";

const Update = () => {
  const router = useRouter();
  const id = router.query.id;
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [unit, setUnit] = useState("");
  const [represent, setRep] = useState("");
  const [loading, setLoading] = useState(false);

  useCheckLogin();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailErr("");
    setPhoneErr("");
    setLoading(true);
    const data = {
      email,
      phone,
      unit,
      represent,
    };
    try {
      const response = await api.put(`/clients/${id}`, data);
      console.log(response);
      router.push(`/clients/${id}`);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response.data.error;
      if (
        errorMsg === "Email already in use, please choose a different one." ||
        errorMsg === "Email isn't valid"
      ) {
        setEmailErr(errorMsg);
      } else if (
        errorMsg ===
        "Phone number already in use, please choose a different one."
      ) {
        setPhoneErr(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1>Update Client</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            error={!!emailErr}
            helperText={emailErr}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            error={!!phoneErr}
            helperText={phoneErr}
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            placeholder="Representer"
            value={represent}
            onChange={(e) => setRep(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <TextField
            placeholder="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            InputProps={{
              style: { height: "40px" },
            }}
            style={{ width: "280px" }}
          />
          <button disabled={loading} type="submit">
            {loading ? "Updating..." : "Update"}
          </button>
          <Link href={`/clients/${id}`}>
            <button>Back to clients profile</button>
          </Link>
        </form>
      </div>
    </>
  );
};

export default Update;
