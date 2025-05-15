document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const balanceElement = document.getElementById('balance');
    const incomeElement = document.getElementById('income');
    const expenseElement = document.getElementById('expense');
    const resetButton = document.getElementById('reset');
    const incomeForm = document.getElementById('income-form');
    const expenseForm = document.querySelector('.expense-form');
    const historyContainer = document.querySelector('.history-container');

    // Modal Elements
    const resetModal = document.getElementById('reset-modal');
    const confirmReset = document.getElementById('confirm-reset');
    const cancelReset = document.getElementById('cancel-reset');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const cancelEdit = document.getElementById('cancel-edit');
    const editNameInput = document.getElementById('edit-name');
    const editAmountInput = document.getElementById('edit-amount');

    // Track which transaction is being edited
    let currentlyEditingId = null;

    // Initialize data from localStorage or defaults
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Initialize the app
    updateAll();

    // Event Listeners
    resetButton.addEventListener('click', openResetModal);
    confirmReset.addEventListener('click', resetAll);
    cancelReset.addEventListener('click', closeResetModal);
    incomeForm.addEventListener('submit', addTransaction);
    expenseForm.addEventListener('submit', addTransaction);
    cancelEdit.addEventListener('click', closeEditModal);
    editForm.addEventListener('submit', saveEditedTransaction);

    // Modal Functions
    function openResetModal() {
        resetModal.style.display = 'flex';
    }

    function closeResetModal() {
        resetModal.style.display = 'none';
    }

    function openEditModal(transactionId) {
        const transaction = transactions[transactionId];
        editNameInput.value = transaction.name;
        editAmountInput.value = Math.abs(transaction.amount);
        currentlyEditingId = transactionId;
        editModal.style.display = 'flex';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        currentlyEditingId = null;
    }

    // Core Functions
    function updateAll() {
        updateBalance();
        updateIncomeAndExpense();
        updateHistory();
    }

    function updateBalance() {
        const amounts = transactions.map(transaction => transaction.amount);
        const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
        balanceElement.textContent = total;
    }

    function updateIncomeAndExpense() {
        const amounts = transactions.map(transaction => transaction.amount);

        const income = amounts
            .filter(item => item > 0)
            .reduce((acc, item) => (acc += item), 0)
            .toFixed(2);

        const expense = amounts
            .filter(item => item < 0)
            .reduce((acc, item) => (acc += item), 0)
            .toFixed(2);

        incomeElement.textContent = income;
        expenseElement.textContent = Math.abs(expense);
    }

    function updateHistory() {
        historyContainer.innerHTML = '';

        if (transactions.length === 0) {
            historyContainer.innerHTML = '<p class="empty-text">No transactions yet</p>';
            return;
        }

        transactions.forEach((transaction, index) => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'entries';

            const amountColor = transaction.amount > 0 ? 'income-color' : 'expense-color';
            const sign = transaction.amount > 0 ? '+' : '-';

            transactionElement.innerHTML = `
                <p><i class="fa-solid fa-pen-to-square edit-btn" data-id="${index}"></i> ${transaction.name}</p>
                <p class="${amountColor}">${sign}$${Math.abs(transaction.amount).toFixed(2)} 
                <i class="fa-solid fa-trash delete-btn" data-id="${index}"></i></p>
            `;
            historyContainer.appendChild(transactionElement);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteTransaction);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                openEditModal(parseInt(this.getAttribute('data-id')));
            });
        });
    }

    function addTransaction(e) {
        e.preventDefault();

        const form = e.target;
        const name = form.querySelector('input[type="text"]').value.trim();
        const amount = parseFloat(form.querySelector('input[type="number"]').value);

        if (!name || isNaN(amount)) {
            alert('Please enter valid name and amount');
            return;
        }

        const transactionAmount = form.classList.contains('expense-form') ? -Math.abs(amount) : Math.abs(amount);

        const transaction = {
            id: Date.now(),
            name,
            amount: transactionAmount
        };

        transactions.push(transaction);
        saveTransactions();
        updateAll();
        form.reset();
    }

    function saveEditedTransaction(e) {
        e.preventDefault();

        const newName = editNameInput.value.trim();
        const newAmount = parseFloat(editAmountInput.value);

        if (!newName || isNaN(newAmount)) {
            alert('Please enter valid name and amount');
            return;
        }

        const transaction = transactions[currentlyEditingId];
        const updatedAmount = transaction.amount > 0 ? newAmount : -newAmount;

        transactions[currentlyEditingId] = {
            ...transaction,
            name: newName,
            amount: updatedAmount
        };

        saveTransactions();
        updateAll();
        closeEditModal();
    }

    function deleteTransaction(e) {
        const id = parseInt(e.target.getAttribute('data-id'));
        transactions.splice(id, 1);
        saveTransactions();
        updateAll();
    }

    function resetAll() {
        transactions = [];
        saveTransactions();
        updateAll();
        closeResetModal();
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
});