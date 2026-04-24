function goTo(page) {
	window.location.href = page;
}

function logout() {
	localStorage.clear();
	window.location.href = "login.html";
}

function requireAuth() {
	const token = localStorage.getItem("token");
	const refresh = localStorage.getItem("refresh");

	if (!token || !refresh) {
		localStorage.clear();
		window.location.href = "login.html";
		return false;
	}

	return true;
}

function showToast(message, isError = false) {
	const toast = document.createElement("div");
	toast.className = `toast ${isError ? "error" : ""}`;
	toast.innerText = message;

	document.body.appendChild(toast);

	setTimeout(() => toast.classList.add("show"), 100);

	setTimeout(() => {
		toast.classList.remove("show");
		setTimeout(() => toast.remove(), 300);
	}, 3000);
}

// loading no botão
function setLoading(button, isLoading) {
	if (isLoading) {
		button.classList.add("loading");
		// button.dataset.originalText = button.innerText;
		button.innerText = "Salvando...";
	} else {
		button.classList.remove("loading");
		// button.innerText = button.dataset.originalText;
	}
}

function validateFields(fields) {
	for (let field of fields) {
		if (!field.value) {
			showToast("Preencha todos os campos!", true);
			return false;
		}
	}
	return true;
}

async function deleteResource(url, successMessage, reloadFn) {
	if (!confirm("Tem certeza que deseja excluir?")) return;

	const res = await fetchWithAuth(url, {
		method: "DELETE"
	});

	if (!res.ok) {
		showToast("Erro ao deletar", true);
		return;
	}

	showToast(successMessage);
	await reloadFn();
}
