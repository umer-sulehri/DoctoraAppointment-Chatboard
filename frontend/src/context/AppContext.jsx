import { createContext, useState, useCallback } from "react";
import { API } from "../services/api";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
    const [appointments, setAppointments] = useState([]);

    const currencySymbol = '$';

    // Fetch doctors
    const fetchDoctors = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            const response = await API.getDoctors(filters);
            const doctorsList = response.data?.doctors?.data || response.data?.doctors || response.data || [];
            setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch doctors');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch specialties
    const fetchSpecialties = useCallback(async () => {
        try {
            const response = await API.getSpecialties();
            setSpecialties(response.data?.specialties || []);
        } catch (err) {
            console.error('Failed to fetch specialties:', err);
        }
    }, []);

    // Fetch user profile
    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await API.getMe();
            if (response.data?.user) {
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
            }
        }
    }, []);

    // Login
    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            const response = await API.login({ email, password });
            localStorage.setItem('authToken', response.data.token);
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setIsAuthenticated(true);
            setError(null);
            return response.data;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Login failed';
            setError(errMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Register
    const register = useCallback(async (formData) => {
        try {
            setLoading(true);
            const response = await API.register(formData);
            localStorage.setItem('authToken', response.data.token);
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setIsAuthenticated(true);
            setError(null);
            return response.data;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Registration failed';
            setError(errMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await API.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            setAppointments([]);
        }
    }, []);

    // Fetch user appointments
    const fetchMyAppointments = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await API.getMyAppointments(page);
            const apptsData = response.data?.appointments?.data || response.data?.appointments || [];
            setAppointments(Array.isArray(apptsData) ? apptsData : []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    }, []);

    // Book appointment
    const bookAppointment = useCallback(async (appointmentData) => {
        try {
            setLoading(true);
            const response = await API.bookAppointment(appointmentData);
            setError(null);
            return response.data;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Failed to book appointment';
            setError(errMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        doctors,
        specialties,
        user,
        loading,
        error,
        isAuthenticated,
        appointments,
        currencySymbol,
        fetchDoctors,
        fetchSpecialties,
        fetchUserProfile,
        login,
        register,
        logout,
        fetchMyAppointments,
        bookAppointment,
        setError,
        setLoading,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
