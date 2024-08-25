document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transactionForm');
    const transactionList = document.getElementById('transactionList');
    const balanceElement = document.getElementById('balance');
    const incomeElement = document.getElementById('income');
    const expenseElement = document.getElementById('expense');

    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = document.getElementById('type').checked ? 'expense' : 'income';
        const name = form.name.value.trim();
        const amount = parseFloat(form.amount.value);
        const date = form.date.value;

        if (name === '' || isNaN(amount) || date === '') {
            alert('Please fill out all fields correctly.');
            return;
        }

        const transaction = document.createElement('li');
        transaction.textContent = `${date} - ${name}: $${amount.toFixed(2)} (${type})`;

        if (type === 'income') {
            totalIncome += amount;
            totalBalance += amount;
        } else if (type === 'expense') {
            totalExpense += amount;
            totalBalance -= amount;
        }

        transactionList.appendChild(transaction);

        // Update the UI
        balanceElement.textContent = `$${totalBalance.toFixed(2)}`;
        incomeElement.textContent = `$${totalIncome.toFixed(2)}`;
        expenseElement.textContent = `$${totalExpense.toFixed(2)}`;

        // Reset the form
        form.reset();
    });
});
