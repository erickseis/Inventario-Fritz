import { useEffect, useState } from "react";
import { obtenerUsuarioLogueado } from "../service/connection";

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await obtenerUsuarioLogueado(userId);
      console.log("funcion obtener usuario loguado hook", response);
      setUser(response);
      setError(null);
    } catch (err) {
      console.error("Error al obtener datos del usuario:", err);
      setError(err.message || "Error al cargar datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log("usuario data use hook", userData);
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData?.userId) {
          fetchUserData(parsedUserData.userId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al parsear datos del usuario:", err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser?.userId) {
          fetchUserData(parsedUser.userId);
        }
      } catch (err) {
        console.error("Error al parsear datos del usuario:", err);
      }
    }
  };

  const clearUser = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("user");
  };

  return {
    user,
    loading,
    error,
    refreshUser,
    clearUser,
    isAuthenticated: !!user,
  };
};
