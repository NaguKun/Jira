import { useState, useCallback } from 'react';
import { authApi } from '../services/api';
import { User, LoginRequest, SignupRequest } from '../types';

interface UseAuthReturn {
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginRequest) => Promise<User | null>;
    signup: (data: SignupRequest) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (credentials: LoginRequest): Promise<User | null> => {
        setIsLoading(true);
        setError(null);

        try {
            // Get token
            const tokenResponse = await authApi.login(credentials);
            const { access_token } = tokenResponse.data;

            // Store token
            localStorage.setItem('access_token', access_token);

            // Get user info
            const userResponse = await authApi.getMe();
            const user = userResponse.data as User;

            return user;
        } catch (err: any) {
            const message = err.response?.data?.detail || 'Login failed. Please try again.';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (data: SignupRequest): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await authApi.signup(data);
            return true;
        } catch (err: any) {
            const message = err.response?.data?.detail || 'Signup failed. Please try again.';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        window.location.href = '/#/login';
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
    };
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('access_token');
};
