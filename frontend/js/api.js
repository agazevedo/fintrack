const API_BASE = "http://127.0.0.1:8000/api";

// headers sempre atualizados
function getHeaders(token = null) {
	const t = token || localStorage.getItem("token");

	return {
		"Content-Type": "application/json",
		"Authorization": `Bearer ${t}`
	};
}

// refresh automático
async function refreshToken() {
	const refresh = localStorage.getItem("refresh");

	const res = await fetch(`${API_BASE}/auth/refresh/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ refresh })
	});

	const data = await res.json();

	if (data.access) {
		localStorage.setItem("token", data.access);
		return data.access;
	} else {
		localStorage.clear();
		window.location.href = "login.html";
	}
}

// fetch inteligente
async function fetchWithAuth(url, options = {}) {
	let res = await fetch(url, {
		...options,
		headers: getHeaders()
	});

	// se token expirou tenta refresh
	if (res.status === 401) {
		const newToken = await refreshToken();

		res = await fetch(url, {
			...options,
			headers: getHeaders(newToken)
		});
	}

	return res;
}
