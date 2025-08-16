import axios from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
	withCredentials: true,
});

// Attach bearer token from localStorage if present
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

let refreshing = false;
let queue = [];

function processQueue(error, token = null) {
	queue.forEach(({ resolve, reject }) => {
		if (error) reject(error);
		else resolve(token);
	});
	queue = [];
}

// Refresh on 401
api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config;
		if (error.response?.status === 401 && !original._retry) {
			original._retry = true;
			if (refreshing) {
				return new Promise((resolve, reject) => {
					queue.push({ resolve, reject });
				})
					.then((token) => {
						if (token) original.headers.Authorization = `Bearer ${token}`;
						return api(original);
					})
					.catch(Promise.reject);
			}

			refreshing = true;
			try {
				const { data } = await api.post('/auth/refresh');
				localStorage.setItem('token', data.token);
				processQueue(null, data.token);
				original.headers.Authorization = `Bearer ${data.token}`;
				return api(original);
			} catch (err) {
				processQueue(err, null);
				localStorage.removeItem('token');
				return Promise.reject(err);
			} finally {
				refreshing = false;
			}
		}
		return Promise.reject(error);
	}
);

export default api;
