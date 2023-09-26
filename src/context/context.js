import React, { useState, useEffect, createContext, useContext } from "react";
import api from "@/api/api";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("users?list=email,name")

      .then((data) => {
        setUsers(data.data.users);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ users, loadings, error }}>
      {children}
    </UserContext.Provider>
  );
};

const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};

export { UserProvider, useUsers };
