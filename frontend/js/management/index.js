function initManagement() {
	if (!requireAuth()) return;

	setupEventListeners();
	renderForm();
}

async function renderForm() {
	const value = document.getElementById("action-select").value;

	// esconder forms
	document.querySelectorAll(".form-section").forEach(el => {
		el.style.display = "none";
	});

	document.getElementById(`${value}-form`).style.display = "block";

	document.querySelectorAll(".list-section").forEach(el => {
		el.style.display = "none";
	});

	document.getElementById(`${value}-list`).style.display = "block";

	const loaders = {
		category: loadCategoriesList,
		item: loadItemsList,
		expense: loadExpensesList
	};

	await loaders[value]?.();

	if (value === "item") await populateCategorySelect();
	if (value === "expense") {
		await populateExpenseCategorySelect();

		const categorySelect = document.getElementById("exp-category");
		await populateItemSelect(categorySelect.value);
	}
}

function setupEventListeners() {
	document.getElementById("cat-submit")
		.addEventListener("click", createCategory);

	document.getElementById("item-submit")
		.addEventListener("click", createItem);

	document.getElementById("exp-submit")
		.addEventListener("click", createExpense);

	document.getElementById("exp-category")
		.addEventListener("change", (e) => {
			populateItemSelect(e.target.value);
		});

	document.getElementById("item-cancel")
		.addEventListener("click", resetItemForm);

	document.getElementById("cat-cancel")
		.addEventListener("click", resetCategoryForm);

	document.getElementById("exp-cancel")
		.addEventListener("click", resetExpenseForm);
}
