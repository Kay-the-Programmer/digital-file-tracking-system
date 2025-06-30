// --- API SETUP ---
export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const getAuthHeaders = (isFormData: boolean = false): HeadersInit => {
    const token = localStorage.getItem('access_token');

    // For FormData, we do NOT set the 'Content-Type'. The browser does it automatically
    // and includes the necessary boundary string. For all other requests, we set it to application/json.
    const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Token Refresh Logic
let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void, reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const refreshTokenInternal = async (): Promise<string | null> => {
    try {
        const refresh_token = localStorage.getItem('refresh_token');
        if (!refresh_token) {
            throw new Error("No refresh token available.");
        }

        const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refresh_token }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token.');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
    } catch (error) {
        console.error("Token refresh failed:", error);
        // Clear tokens from localStorage instead of calling logout API
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // The auth store will handle the rest of the logout process
        return null;
    }
};

export const apiRequest = async <T>(method: string, path: string, body: any = null): Promise<T> => {
    let response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: getAuthHeaders(),
        body: body ? JSON.stringify(body) : null,
    });

    if (response.status === 401) {
        // Skip token refresh for logout endpoint to prevent circular dependency
        if (path === '/auth/logout/') {
            throw new Error('Authentication credentials were not provided.');
        }

        if (!isRefreshing) {
            isRefreshing = true;
            const newAccessToken = await refreshTokenInternal();
            isRefreshing = false;

            if (newAccessToken) {
                processQueue(null, newAccessToken);
                // Retry the original request with the new token
                response = await fetch(`${API_BASE_URL}${path}`, {
                    method,
                    headers: getAuthHeaders(), // Will now have the new token
                    body: body ? JSON.stringify(body) : null,
                });
            } else {
                // If token refresh failed, reject all queued requests
                processQueue(new Error('Token refresh failed'));
                throw new Error('Authentication failed after token refresh attempt');
            }
        } else {
            // If a refresh is already in progress, wait for it to complete
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                // Retry the original request after the token has been refreshed
                return apiRequest<T>(method, path, body);
            }).catch(error => {
                throw error; // Propagate the error if token refresh failed
            });
        }
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API request failed: ${response.statusText}`);
    }

    return response.status === 204 ? (null as T) : (response.json() as Promise<T>);
};

// File upload API utility
export const apiFileUpload = async <T>(path: string, file: File): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file); // The backend expects a field named 'file'

    const options: RequestInit = {
        method: 'POST',
        headers: getAuthHeaders(true), // Pass true to avoid setting Content-Type
        body: formData,
    };

    const response = await fetch(`${API_BASE_URL}${path}`, options);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `File upload failed: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
};
// Mock API utility for development
export const mockApiCall = <T,>(data: T, delay = 500): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay);
    });
};
