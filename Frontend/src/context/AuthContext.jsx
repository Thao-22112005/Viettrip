import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("viettrip_user");

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem("viettrip_user");
                setUser(null);
            }
        }

        setLoading(false);
    }, []);

    const login = (userData) => {
        const userWithRole = {
            ...userData,
            role: userData.role || "User",
        };

        localStorage.setItem(
            "viettrip_user",
            JSON.stringify(userWithRole)
        );

        if (userData.token) {
            localStorage.setItem("token", userData.token);
        }

        setUser(userWithRole);

        return userWithRole;
    };

    const logout = () => {
        localStorage.removeItem("viettrip_user");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth phải được sử dụng bên trong AuthProvider"
        );
    }

    return context;
}