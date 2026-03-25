document.getElementById("login-form").addEventListener("submit", async (e) => {
	e.preventDefault();

	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ username, password })
	});

	const data = await response.json();

	if (data.access) {
		localStorage.setItem("token", data.access);
		localStorage.setItem("refresh", data.refresh);
		window.location.href = "index.html";
	} else {
		alert("Erro no login");
	}
});
