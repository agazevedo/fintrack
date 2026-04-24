async function fetchExpenses() {
	const res = await fetchWithAuth(`${API_BASE}/expenses/`);
	const data = await res.json();

	if (!res.ok) {
		showToast("Erro ao buscar despesas", true);
		return [];
	}

	return data;
}

async function loadExpensesList() {
	const expenses = await fetchExpenses();

	const container = document.querySelector("#expense-list .list-content");
	container.innerHTML = "";

	expenses.forEach(e => {
		container.innerHTML += `
			<div class="list-item">
				<span>
					${e.budget_item_name}<br>
					R$ ${e.unit_value} x ${e.quantity} =
					<strong>R$ ${Number(e.total).toFixed(2)}</strong>
				</span>
				<div>
					<button onclick="editExpense(${e.id}, ${e.budget_item}, ${e.unit_value}, ${e.quantity}, \`${e.date}\`)">✏️</button>
					<button onclick="deleteExpense(${e.id})">🗑️</button>
				</div>
			</div>
		`;
	});
}

async function createExpense(e) {
	const button = e.target;

	const item = document.getElementById("exp-item");
	const value = document.getElementById("exp-value");
	const quantity = document.getElementById("exp-quantity");
	const date = document.getElementById("exp-date");

	if (!validateFields([item, value, quantity, date])) return;

	const expenses = await fetchExpenses();

	const alreadyExists = expenses.some(e =>
		e.budget_item == item.value &&
		e.date === date.value &&
		e.id !== state.expense.editingId
	);

	if (alreadyExists) {
		showToast("Despesa já cadastrada", true);
		return;
	}

	setLoading(button, true);

	try {
		let url = `${API_BASE}/expenses/`;
		let method = "POST";

		if (state.expense.editingId) {
			url += `${state.expense.editingId}/`;
			method = "PUT";
		}

		const res = await fetchWithAuth(url, {
			method,
			body: JSON.stringify({
				budget_item: item.value,
				unit_value: value.value,
				quantity: quantity.value,
				date: date.value
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

		showToast("Despesa criada com sucesso!");
		resetExpenseForm();
		await loadExpensesList();
	} catch (err) {
		console.log(err);
		showToast("Erro inesperado", true);
	}

	setLoading(button, false);
}

function deleteExpense(id) {
	return deleteResource(
		`${API_BASE}/expenses/${id}/`,
		"Despesa removida!",
		loadExpensesList
	)
}

function editExpense(id, item, value, quantity, date) {
	document.getElementById("exp-item").value = item;
	document.getElementById("exp-value").value = value;
	document.getElementById("exp-quantity").value = quantity;
	document.getElementById("exp-date").value = date;
	state.expense.editingId = id;

	document.getElementById("exp-submit").innerText = "Atualizar";
	document.getElementById("exp-cancel").style.display = "inline-block";
}

function resetExpenseForm() {
	document.getElementById("exp-item").selectedIndex = 0;
	document.getElementById("exp-value").value = "";
	document.getElementById("exp-quantity").value = "";
	document.getElementById("exp-date").value = "";
	state.expense.editingId = null;

	document.getElementById("exp-submit").innerText = "Cadastrar";
	document.getElementById("exp-cancel").style.display = "none";
}

async function populateItemSelect(categoryId = null) {
	const items = await fetchItems();

	const filtered = categoryId
		? items.filter(i => i.category == categoryId)
		: items;

	document.getElementById("exp-item").innerHTML = filtered.map(i => `<option value="${i.id}">${i.description}</option>`).join("");
}

async function populateExpenseCategorySelect() {
	const [categories, items] = await Promise.all([
		fetchCategories(),
		fetchItems()
	]);

	// pega ids das categorias que têm itens
	const categoryIdsWithItems = new Set(items.map(i => i.category));

	// filtra categorias
	const filtered = categories.filter(c => categoryIdsWithItems.has(c.id));

	if (filtered.length === 0) {
		document.getElementById("exp-category").innerHTML =
			`<option disabled selected>Sem categorias com itens</option>`;
		return;
	}

	document.getElementById("exp-category").innerHTML = filtered.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}
