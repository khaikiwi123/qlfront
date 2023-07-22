import Link from "next/link";
const logOut = () => {
  return (
    <div>
      <h1>Logout</h1>
      <p>You are logged out</p>
      <p>
        <Link href="/login">Log back in</Link>
      </p>
    </div>
  );
};

export default logOut;
