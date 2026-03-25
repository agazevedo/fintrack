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

	container.innerHTML += `
		<div class="card">
			<h2>Resumo Geral</h2>
			<p>Previsto: R$ ${totalPlanned.toFixed(2)}</p>
			<p>Gasto: R$ ${totalSpent.toFixed(2)}</p>
			<p style="color:${totalRemaining < 0 ? 'red' : 'lightgreen'}">
				Restante: R$ ${totalRemaining.toFixed(2)}
			</p>
		</div>
	`;

	// items.forEach(item => {
	// 	container.innerHTML += `
	// 		<div class="card">
	// 			<h3>${item.description}</h3>
	// 			<p>Previsto: R$ ${Number(item.budget_total).toFixed(2)}</p>
	// 			<p>Gasto: R$ ${Number(item.spent).toFixed(2)}</p>
	// 			<p style="color:${item.remaining < 0 ? 'red' : 'lightgreen'}">
	// 				Restante: R$ ${Number(item.remaining).toFixed(2)}
	// 			</p>
	// 		</div>
	// 	`;
	// });
}
