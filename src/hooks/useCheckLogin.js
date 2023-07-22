import { useEffect } from "react";
import { useRouter } from "next/router";

const useCheckLogin = () => {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("logged_in");
    if (loggedIn !== "true") {
      router.push("/login");
    }
  }, [router]);
};

export default useCheckLogin;
