// Initialize app data
function initializeAppData() {
    const initialData = {
        user: {
            firstName: 'Ravia',
            lastName: 'Begum',
            email: 'ravia.begum@khanbank.com',
            phone: '(555) 123-4567',
            address: '123 Banking Street, Finance District, NY 10001'
        },
        accounts: {
            checking: {
                balance: 300000,
                accountNumber: '****1234',
                transactions: [
                    {
                        id: Date.now() + 1,
                        type: 'credit',
                        description: 'Initial Deposit',
                        amount: 300000,
                        date: new Date().toISOString(),
                        balance: 300000
                    }
                ]
            },
            savings: {
                balance: 200000,
                accountNumber: '****5678',
                transactions: [
                    {
                        id: Date.now() + 2,
                        type: 'credit',
                        description: 'Initial Deposit',
                        amount: 200000,
                        date: new Date().toISOString(),
                        balance: 200000
                    }
                ]
            }
        }
    };
    
    localStorage.setItem('khanBankData', JSON.stringify(initialData));
}

// Get app data
function getAppData() {
    const data = localStorage.getItem('khanBankData');
    return data ? JSON.parse(data) : null;
}

// Save app data
function saveAppData(data) {
    localStorage.setItem('khanBankData', JSON.stringify(data));
}

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('khanBankLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Logout
function logout() {
    localStorage.removeItem('khanBankLoggedIn');
    window.location.href = 'index.html';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize navigation
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Close menu when clicking on a link (mobile)
    const navLinks = document.querySelectorAll('.nav-menu a:not(#logoutBtn)');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });
}

// Load dashboard
function loadDashboard() {
    const data = getAppData();
    if (!data) return;
    
    // Update user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = data.user.firstName;
    }
    
    // Update account balances
    const checkingBalanceEl = document.getElementById('checkingBalance');
    const savingsBalanceEl = document.getElementById('savingsBalance');
    
    if (checkingBalanceEl) {
        checkingBalanceEl.textContent = formatCurrency(data.accounts.checking.balance);
    }
    if (savingsBalanceEl) {
        savingsBalanceEl.textContent = formatCurrency(data.accounts.savings.balance);
    }
    
    // Load recent transactions
    loadRecentTransactions();
}

// Load recent transactions
function loadRecentTransactions() {
    const data = getAppData();
    if (!data) return;
    
    const recentTransactionsEl = document.getElementById('recentTransactions');
    if (!recentTransactionsEl) return;
    
    // Combine all transactions and sort by date
    const allTransactions = [
        ...data.accounts.checking.transactions.map(t => ({...t, account: 'Checking'})),
        ...data.accounts.savings.transactions.map(t => ({...t, account: 'Savings'}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Show last 5 transactions
    const recentTransactions = allTransactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        recentTransactionsEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }
    
    recentTransactionsEl.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.description}</h4>
                    <p>${transaction.account} • ${formatDate(transaction.date)}</p>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
        </div>
    `).join('');
}

// Load account page
function loadAccountPage(accountType) {
    const data = getAppData();
    if (!data) return;
    
    const account = data.accounts[accountType];
    
    // Update balance
    const balanceEl = document.getElementById(`${accountType}Balance`);
    if (balanceEl) {
        balanceEl.textContent = formatCurrency(account.balance);
    }
    
    // Load transactions
    const transactionsEl = document.getElementById(`${accountType}Transactions`);
    if (!transactionsEl) return;
    
    if (account.transactions.length === 0) {
        transactionsEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }
    
    const sortedTransactions = [...account.transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    transactionsEl.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance</th>
                </tr>
            </thead>
            <tbody>
                ${sortedTransactions.map(transaction => `
                    <tr>
                        <td>${formatDate(transaction.date)}</td>
                        <td>${transaction.description}</td>
                        <td><span style="color: ${transaction.type === 'credit' ? 'var(--success-color)' : 'var(--error-color)'}; font-weight: 500; text-transform: capitalize;">${transaction.type}</span></td>
                        <td style="color: ${transaction.type === 'credit' ? 'var(--success-color)' : 'var(--error-color)'}; font-weight: 600;">${transaction.type === 'credit' ? '+' : '-'}${formatCurrency(transaction.amount)}</td>
                        <td style="font-weight: 600;">${formatCurrency(transaction.balance)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load transfer page
function loadTransferPage() {
    const data = getAppData();
    if (!data) return;
    
    // Update balance displays
    updateBalanceDisplays(data);
    
    // Handle form submission
    const transferForm = document.getElementById('transferForm');
    const fromAccountSelect = document.getElementById('fromAccount');
    const toAccountSelect = document.getElementById('toAccount');
    
    // Prevent selecting same account
    fromAccountSelect.addEventListener('change', () => {
        const fromValue = fromAccountSelect.value;
        Array.from(toAccountSelect.options).forEach(option => {
            if (option.value === fromValue) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    });
    
    transferForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleTransfer();
    });
}

// Update balance displays
function updateBalanceDisplays(data) {
    const checkingBalanceDisplay = document.getElementById('checkingBalanceDisplay');
    const savingsBalanceDisplay = document.getElementById('savingsBalanceDisplay');
    
    if (checkingBalanceDisplay) {
        checkingBalanceDisplay.textContent = formatCurrency(data.accounts.checking.balance);
    }
    if (savingsBalanceDisplay) {
        savingsBalanceDisplay.textContent = formatCurrency(data.accounts.savings.balance);
    }
}

// Handle transfer
function handleTransfer() {
    const data = getAppData();
    const fromAccount = document.getElementById('fromAccount').value;
    const toAccount = document.getElementById('toAccount').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value || 'Transfer between accounts';
    const messageEl = document.getElementById('transferMessage');
    
    // Validation
    if (!fromAccount || !toAccount) {
        showMessage(messageEl, 'Please select both accounts', 'error');
        return;
    }
    
    if (fromAccount === toAccount) {
        showMessage(messageEl, 'Cannot transfer to the same account', 'error');
        return;
    }
    
    if (amount <= 0) {
        showMessage(messageEl, 'Amount must be greater than 0', 'error');
        return;
    }
    
    if (data.accounts[fromAccount].balance < amount) {
        showMessage(messageEl, 'Insufficient funds', 'error');
        return;
    }
    
    // Perform transfer
    const timestamp = new Date().toISOString();
    
    // Debit from source account
    data.accounts[fromAccount].balance -= amount;
    data.accounts[fromAccount].transactions.push({
        id: Date.now(),
        type: 'debit',
        description: `Transfer to ${toAccount.charAt(0).toUpperCase() + toAccount.slice(1)}`,
        amount: amount,
        date: timestamp,
        balance: data.accounts[fromAccount].balance
    });
    
    // Credit to destination account
    data.accounts[toAccount].balance += amount;
    data.accounts[toAccount].transactions.push({
        id: Date.now() + 1,
        type: 'credit',
        description: `Transfer from ${fromAccount.charAt(0).toUpperCase() + fromAccount.slice(1)}`,
        amount: amount,
        date: timestamp,
        balance: data.accounts[toAccount].balance
    });
    
    // Save data
    saveAppData(data);
    
    // Update UI
    updateBalanceDisplays(data);
    showMessage(messageEl, `Successfully transferred ${formatCurrency(amount)}!`, 'success');
    
    // Reset form
    document.getElementById('transferForm').reset();
    
    // Scroll to message
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show message
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Load profile page
function loadProfilePage() {
    const data = getAppData();
    if (!data) return;
    
    // Update profile name
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) {
        profileNameEl.textContent = `${data.user.firstName} ${data.user.lastName}`;
    }
    
    // Populate form
    document.getElementById('firstName').value = data.user.firstName;
    document.getElementById('lastName').value = data.user.lastName;
    document.getElementById('email').value = data.user.email;
    document.getElementById('phone').value = data.user.phone;
    document.getElementById('address').value = data.user.address;
    
    // Handle form submission
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleProfileUpdate();
    });
    
    // Handle cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => {
        window.location.reload();
    });
}

// Handle profile update
function handleProfileUpdate() {
    const data = getAppData();
    const messageEl = document.getElementById('profileMessage');
    
    // Update user data
    data.user.firstName = document.getElementById('firstName').value;
    data.user.lastName = document.getElementById('lastName').value;
    data.user.email = document.getElementById('email').value;
    data.user.phone = document.getElementById('phone').value;
    data.user.address = document.getElementById('address').value;
    
    // Save data
    saveAppData(data);
    
    // Update profile name
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) {
        profileNameEl.textContent = `${data.user.firstName} ${data.user.lastName}`;
    }
    
    // Show success message
    showMessage(messageEl, 'Profile updated successfully!', 'success');
    
    // Scroll to message
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
