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

function renderBudgetItems(items) {
	const container = document.getElementById("budget-list");
	container.innerHTML = "";

	items.forEach(item => {
		container.innerHTML += `
			<div class="card">
				<h3>${item.description}</h3>
				<p>Previsto: R$ ${Number(item.budget_total).toFixed(2)}</p>
				<p>Gasto: R$ ${Number(item.spent).toFixed(2)}</p>
			</div>
		`;
	});
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
			}
		}
	});
}
