async function fetchCategories() {
	const res = await fetchWithAuth(`${API_BASE}/categories/`);
	const data = await res.json();

	if (!res.ok) {
		showToast("Erro ao buscar categorias", true);
		return [];
	}

	return data;
}

async function loadCategoriesList() {
	const categories = await fetchCategories();

	const container = document.querySelector("#category-list .list-content");
	container.innerHTML = "";

	categories.forEach(c => {
		container.innerHTML += `
			<div class="list-item">
				<span>${c.name} (${c.type})</span>
				<div>
					<button onclick="editCategory(${c.id}, \`${c.name}\`, \`${c.type}\`)">✏️</button>
					<button onclick="deleteCategory(${c.id})">🗑️</button>
				</div>
			</div>
		`;
	});
}

async function createCategory(e) {
	const button = e.target;

	const name = document.getElementById("cat-name");
	const type = document.getElementById("cat-type");

	if (!validateFields([name, type])) return;

	const categories = await fetchCategories();

	const alreadyExists = categories.some(c =>
		c.name.toLowerCase() === name.value.toLowerCase() &&
		c.id !== state.category.editingId
	);

	if (alreadyExists) {
		showToast("Categoria já existe", true);
		return;
	}

	setLoading(button, true);

	try {
		let url = `${API_BASE}/categories/`;
		let method = "POST";

		if (state.category.editingId) {
			url += `${state.category.editingId}/`;
			method = "PUT";
		}

		const res = await fetchWithAuth(url, {
			method,
			body: JSON.stringify({
				name: name.value,
				type: type.value
			})
		});

		let data;

		try {
			data = await res.json();
		} catch {
			data = { error: "Resposta inválida do servidor" };
		}

		if (!res.ok) {
			showToast(data?.detail || Object.values(data).flat().join(", "), true);
			return;
		}

		showToast("Salvo com sucesso!");
		resetCategoryForm();
		await loadCategoriesList();

	} catch (err) {
		console.log(err);
		showToast("Erro inesperado", true);
	}

	setLoading(button, false);
}

function deleteCategory(id) {
	return deleteResource(
		`${API_BASE}/categories/${id}/`,
		"Categoria removida!",
		loadCategoriesList
	);
}

function editCategory(id, name, type) {
	document.getElementById("cat-name").value = name;
	document.getElementById("cat-type").value = type;
	state.category.editingId = id;

	document.getElementById("cat-submit").innerText = "Atualizar";
	document.getElementById("cat-cancel").style.display = "inline-block";
}

function resetCategoryForm() {
	document.getElementById("cat-name").value = "";
	document.getElementById("cat-type").value = "custeio";
	state.category.editingId = null;

	document.getElementById("cat-submit").innerText = "Cadastrar";
	document.getElementById("cat-cancel").style.display = "none";
}
