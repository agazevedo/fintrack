async function initDashboard() {
	if (!requireAuth()) return;

	await loadDashboard();
}

async function loadDashboard() {
	const res = await fetchWithAuth(`${API_BASE}/budget-items/`);

	if (!res.ok) {
		showToast("Erro ao carregar dashboard", true);
		return;
	}

	const items = await res.json();

	const container = document.getElementById("budget-list");
	container.innerHTML = "";

	let totalPlanned = 0;
	let totalSpent = 0;
	let totalRemaining = 0;

	items.forEach(item => {
		totalPlanned += Number(item.budget_total);
		totalSpent += Number(item.spent);
		totalRemaining += Number(item.remaining);
	});

	renderSummary(totalPlanned, totalSpent, totalRemaining);
	// renderBudgetItems(items);

	const categoryMap = {};

	items.forEach(item => {
		const cat = item.category_name;

		if (!categoryMap[cat]) {
			categoryMap[cat] = 0;
		}

		categoryMap[cat] += Number(item.spent);
	});

	const chartData = Object.entries(categoryMap).map(([categoria, gasto]) => ({ categoria, gasto })).sort((a, b) => b.gasto - a.gasto);

	renderCategoryChart(chartData);
	renderChart(totalSpent, totalRemaining);
}

function renderSummary(totalPlanned, totalSpent, totalRemaining) {
	const container = document.getElementById("budget-list");
	container.innerHTML = `
		<div class="card">
			<h2>Resumo Geral</h2>
			<p>Previsto: R$ ${totalPlanned.toFixed(2)}</p>
			<p>Gasto: R$ ${totalSpent.toFixed(2)}</p>
			<p style="color:${totalRemaining < 0 ? 'red' : 'lightgreen'}">
				Restante: R$ ${totalRemaining.toFixed(2)}
			</p>
		</div>
	`;
}


document.getElementById("modal").addEventListener("click", (e) => {
	if (e.target.id === "modal") {
		closeModal();
	}
});

document.getElementById("modal-close").addEventListener("click", closeModal);

function closeModal() {
	document.getElementById("modal").classList.add("hidden");
}

document.querySelectorAll(".tab-btn").forEach(btn => {
	btn.addEventListener("click", () => {
		// botão ativo
		document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
		btn.classList.add("active");

		// conteúdo
		document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

		const tab = btn.dataset.tab;
		document.getElementById(`tab-${tab}`).classList.add("active");
	});
});


async function showCategoryDetails(categoryName) {
	const res = await fetchWithAuth(`${API_BASE}/expenses/`);

	if (!res.ok) {
		showToast("Erro ao carregar detalhes", true);
		return;
	}

	const expenses = await res.json();

	const filtered = expenses.filter(e => e.category_name === categoryName);

	const modal = document.getElementById("modal");
	const title = document.getElementById("modal-title");

	const expensesBody = document.getElementById("expenses-body");
	const itemsBody = document.getElementById("items-body");
	const summary = document.getElementById("tab-summary");

	title.innerText = `Categoria: ${categoryName}`;

	// limpar
	expensesBody.innerHTML = "";
	itemsBody.innerHTML = "";
	summary.innerHTML = "";

	// 📊 RESUMO
	let total = 0;
	filtered.forEach(e => total += Number(e.total));

	summary.innerHTML = `
		<p>Total gasto: <strong>R$ ${total.toFixed(2)}</strong></p>
		<p>Quantidade de despesas: ${filtered.length}</p>
	`;

	// 📄 DESPESAS
	filtered.forEach(e => {
		expensesBody.innerHTML += `
			<tr>
				<td>${e.date}</td>
				<td>${e.budget_item_name}</td>
				<td>R$ ${Number(e.total).toFixed(2)}</td>
			</tr>
		`;
	});

	// 📦 ITENS (agrupado)
	const itemMap = {};

	filtered.forEach(e => {
		const name = e.budget_item_name;

		if (!itemMap[name]) itemMap[name] = 0;

		itemMap[name] += Number(e.total);
	});

	Object.entries(itemMap).forEach(([item, total]) => {
		itemsBody.innerHTML += `
			<tr>
				<td>${item}</td>
				<td>R$ ${total.toFixed(2)}</td>
			</tr>
		`;
	});

	// abrir modal
	modal.classList.remove("hidden");

	// reset aba pra resumo
	document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
	document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

	document.querySelector('[data-tab="summary"]').classList.add("active");
	document.getElementById("tab-summary").classList.add("active");
}


let chart;

function renderChart(totalSpent, totalRemaining) {
	const ctx = document.getElementById("finance-chart");

	if (chart) {
		chart.destroy();
	}

	chart = new Chart(ctx, {
		type: "doughnut",
		data: {
			labels: ["Gasto", "Restante"],
			datasets: [{
				data: [totalSpent, totalRemaining],
				backgroundColor: ["#e74c3c", "#2ecc71"],
				borderColor: "#333",
				borderWidth: 1.5
			}]
		},
		options: {
			plugins: {
				legend: {
					position: "bottom",
					align: "start",
					labels: {
						boxWidth: 12,
						padding: 10,
						font: {size: 14},
						color: "#e0e0e0"
					}
				}
			}
		}
	});
}

let categoryChart;

function renderCategoryChart(data) {
	const ctx = document.getElementById("category-chart");

	if (categoryChart) {
		categoryChart.destroy();
	}

	categoryChart = new Chart(ctx, {
		type: "pie",
		data: {
			labels: data.map(d => d.categoria),
			datasets: [{
				data: data.map(d => d.gasto),
				backgroundColor: data.map((_, i) => `hsl(${i * 360 / data.length}, 70%, 60%)`),
				borderColor: "#333",
				borderWidth: 1.5
			}]
		},
		options: {
			plugins: {
				legend: {
					position: "bottom",
					align: "start",
					labels: {
						boxWidth: 12,
						padding: 10,
						font: {size: 14},
						color: "#e0e0e0"
					}
				}
			},
			onClick: (evt, elements) => {
				if (elements.length > 0) {
					const index = elements[0].index;
					const categoria = data[index].categoria;

					showCategoryDetails(categoria);
				}
			}
		}
	});
}
