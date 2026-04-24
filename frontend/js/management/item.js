async function fetchItems() {
	const res = await fetchWithAuth(`${API_BASE}/budget-items/`);
	const data = await res.json();

	if (!res.ok) {
		showToast("Erro ao buscar itens", true);
		return [];
	}

	return data;
}

async function loadItemsList() {
	const items = await fetchItems();

	const container = document.querySelector("#item-list .list-content");
	container.innerHTML = "";

	items.forEach(i => {
		container.innerHTML += `
			<div class="list-item">
				<span>
					${i.description}<br>
					[${i.category_name}]<br>
					Previsto: R$ ${i.unit_value} x ${i.quantity} = R$ ${i.budget_total}
				</span>
				<div>
					<button onclick="editItem(${i.id}, \`${i.description}\`, ${i.unit_value}, ${i.quantity}, ${i.category})">✏️</button>
					<button onclick="deleteItem(${i.id})">🗑️</button>
				</div>
			</div>
		`;
	});
}

async function createItem(e) {
	const button = e.target;

	const description = document.getElementById("item-description");
	const unit_value = document.getElementById("item-unit_value");
	const quantity = document.getElementById("item-quantity");
	const category = document.getElementById("item-category");

	if (!validateFields([description, unit_value, quantity, category])) return;

	const items = await fetchItems();

	const alreadyExists = items.some(i =>
		i.description === description.value &&
		i.category == category.value &&
		i.id !== state.item.editingId // importante pra edição
	);

	if (alreadyExists) {
		showToast("Item já existe nessa categoria", true);
		return;
	}

	setLoading(button, true);

	const isEditing = !!state.item.editingId;

	try {
		let url = `${API_BASE}/budget-items/`;
		let method = "POST";

		if (state.item.editingId) {
			url += `${state.item.editingId}/`;
			method = "PUT";
		}

		const res = await fetchWithAuth(url, {
			method,
			body: JSON.stringify({
				description: description.value,
				unit_value: Number(unit_value.value),
				quantity: Number(quantity.value),
				category: category.value
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

		const action = isEditing ? "atualizado" : "criado";
		showToast(`Item ${action} com sucesso!`);
		resetItemForm();
		await loadItemsList();
	} catch (err) {
		console.log(err);
		showToast("Erro inesperado", true);
	}

	setLoading(button, false);
}

function deleteItem(id) {
	return deleteResource(
		`${API_BASE}/budget-items/${id}/`,
		"Item removido!",
		loadItemsList
	);
}

function editItem(id, description, value, quantity, category) {
	document.getElementById("item-description").value = description;
	document.getElementById("item-unit_value").value = value;
	document.getElementById("item-quantity").value = quantity;
	document.getElementById("item-category").value = category;
	state.item.editingId = id;

	updateItemFormUI();
}

function resetItemForm() {
	document.getElementById("item-description").value = "";
	document.getElementById("item-unit_value").value = "";
	document.getElementById("item-quantity").value = "";
	// document.getElementById("item-category").selectedIndex = 0;
	state.item.editingId = null;

	updateItemFormUI();
}

function updateItemFormUI() {
	const isEditing = !!state.item.editingId;

	document.getElementById("item-submit").innerText = isEditing ? "Atualizar" : "Cadastrar";
	document.getElementById("item-cancel").style.display = isEditing ? "inline-block" : "none";
}

async function populateCategorySelect() {
	const categories = await fetchCategories();

	document.getElementById("item-category").innerHTML =
		categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}
