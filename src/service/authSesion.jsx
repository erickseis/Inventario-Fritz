import api from "./api";

// GUARDAR USUARIO
export const setUser = (user) => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      userId: user.userId,
      isLoggedIn: user.isLoggedIn !== undefined ? user.isLoggedIn : true,
    }),
  );
};

// OBTENER USUARIO
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

// ELIMINAR USUARIO
export const clearUser = () => {
  localStorage.removeItem("user");
};

export const registro = async (data) => {
  try {
    const response = await api.post("/login_inventario/register", data);
    return response.data;
  } catch (error) {
    console.error(
      "Error al registrarte:",
      error.response?.data || error.message,
    );
    throw error.response?.data || error;
  }
};

export const login = async (data) => {
  try {
    const response = await api.post("/login_inventario/login", data);
    // Extraer directamente los datos de la respuesta
    const { userId, accessToken, refreshToken } = response.data;

    // Almacenar tokens
    setToken(accessToken);
    setTokenRefresh(refreshToken);

    // Almacenar userId e isLoggedIn en el usuario
    setUser({ userId, isLoggedIn: true });

    return response.data;
  } catch (error) {
    console.error("Error al obtener datos del servidor:", error.message);
  }
};
// LOGOUT
export const logout = async (refresh) => {
  try {
    const response = await api.post("/usuarios/logout", {
      refreshToken: refresh,
    });
    clearUser();
    deleteToken();
    deleteTokenRefresh();
    return response.data;
  } catch (error) {
    throw new Error(`Error al cerrar la sesión ${error}`);
  }
};

//

//
// GUARDAR TOKEN
export const setToken = (token) => {
  localStorage.setItem("authToken", token);
};

export const setTokenRefresh = (token) => {
  localStorage.setItem("authTokenRefresh", token);
};

// OBTENER TOKEN
export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const getTokenRefresh = () => {
  return localStorage.getItem("authTokenRefresh");
};

// ELIMINAR TOKEN
export const deleteToken = () => {
  localStorage.removeItem("authToken");
};

export const deleteTokenRefresh = () => {
  localStorage.removeItem("authTokenRefresh");
};

// OBTENER USER ID
export const getUserId = () => {
  const user = getUser();
  console.log("Datos obtenidos de localStorage:", user); // Depuración
  return user ? user.userId : undefined;
};

// VERIFICAR SI ESTÁ LOGUEADO
export const isLoggedIn = () => {
  const user = getUser();
  return user ? user.isLoggedIn : false;
};
