console.log('Akwadra Super Builder Initialized');

// --- State Management ---
const state = {
    currentCoin: 'BTC',
    wallet: {
        USD: 50000,
        BTC: 0.15,
        ETH: 4.5
    },
    prices: {
        BTC: 64230.50,
        ETH: 3450.75
    },
    history: [],
    mode: 'buy' // 'buy' or 'sell'
};

// --- DOM Elements ---
document.addEventListener('DOMContentLoaded', () => {
    // Original Feature: Card Click
    const card = document.querySelector('.card');
    const landingSection = document.getElementById('landing-section');
    const cryptoApp = document.getElementById('crypto-app');
    const enterBtn = document.getElementById('enter-app-btn');
    const body = document.body;

    // Preserve original alert on card click, but prevent if button clicked
    card.addEventListener('click', (e) => {
        if (e.target !== enterBtn) {
            console.log('تم النقر على البطاقة!');
            // alert('أهلاً بك في عالم البناء بدون كود!'); // Commented out to improve UX flow, can uncomment if strictly needed
        }
    });

    // Transition to App
    enterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        landingSection.classList.add('fade-out');
        setTimeout(() => {
            landingSection.style.display = 'none';
            cryptoApp.classList.remove('opacity-0', 'pointer-events-none');
            cryptoApp.classList.add('fade-in');
            startMarketSimulation();
        }, 700);
    });

    // App Initialization
    initializeUI();
});

function initializeUI() {
    updateWalletUI();
    renderPrices();
    setupEventListeners();
    renderOrderBook();
}

function setupEventListeners() {
    // Coin Switching
    document.querySelectorAll('.pair-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.pair-item').forEach(p => p.classList.remove('active-pair'));
            item.classList.add('active-pair');
            state.currentCoin = item.dataset.coin;
            updateChartUI();
            renderPrices(); // Immediate update
        });
    });

    // Buy/Sell Tabs
    const btnBuy = document.getElementById('tab-buy');
    const btnSell = document.getElementById('tab-sell');
    const executeBtn = document.getElementById('execute-trade-btn');

    btnBuy.addEventListener('click', () => setTradeMode('buy'));
    btnSell.addEventListener('click', () => setTradeMode('sell'));

    // Input Calculation
    const amountInput = document.getElementById('trade-amount');
    const priceInput = document.getElementById('trade-price');
    
    [amountInput, priceInput].forEach(input => {
        input.addEventListener('input', updateTradeTotal);
    });

    // Execute Trade
    executeBtn.addEventListener('click', executeTrade);
}

function setTradeMode(mode) {
    state.mode = mode;
    const btnBuy = document.getElementById('tab-buy');
    const btnSell = document.getElementById('tab-sell');
    const executeBtn = document.getElementById('execute-trade-btn');

    if (mode === 'buy') {
        btnBuy.className = 'flex-1 py-3 rounded-xl font-bold text-white bg-green-600 shadow-lg shadow-green-900/20 transition-all hover:bg-green-500';
        btnSell.className = 'flex-1 py-3 rounded-xl font-bold text-gray-400 bg-slate-700 hover:bg-slate-600 transition-all';
        executeBtn.className = 'w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 transition-all shadow-lg hover:shadow-green-500/20 mt-2';
        executeBtn.textContent = 'تأكيد الشراء';
    } else {
        btnSell.className = 'flex-1 py-3 rounded-xl font-bold text-white bg-red-600 shadow-lg shadow-red-900/20 transition-all hover:bg-red-500';
        btnBuy.className = 'flex-1 py-3 rounded-xl font-bold text-gray-400 bg-slate-700 hover:bg-slate-600 transition-all';
        executeBtn.className = 'w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg hover:shadow-red-500/20 mt-2';
        executeBtn.textContent = 'تأكيد البيع';
    }
}

function updateTradeTotal() {
    const amount = parseFloat(document.getElementById('trade-amount').value) || 0;
    const price = parseFloat(document.getElementById('trade-price').value) || state.prices[state.currentCoin];
    const total = amount * price;
    document.getElementById('trade-total').textContent = `$${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function updateChartUI() {
    // Visual update only
    document.getElementById('chart-title').textContent = `${state.currentCoin}/USD`;
    document.querySelectorAll('.coin-name').forEach(el => el.textContent = state.currentCoin);
    
    // Reset input placeholders
    document.getElementById('trade-price').value = state.prices[state.currentCoin].toFixed(2);
    document.getElementById('trade-amount').value = '';
    updateTradeTotal();
}

// --- Simulation Logic ---
function startMarketSimulation() {
    setInterval(() => {
        // Simulate Price Movement
        const coins = ['BTC', 'ETH'];
        coins.forEach(coin => {
            const change = (Math.random() - 0.5) * (coin === 'BTC' ? 50 : 5);
            state.prices[coin] += change;
        });
        
        renderPrices();
        
        // Occasionally update Order Book
        if (Math.random() > 0.3) renderOrderBook();
        
        // Visual Graph Update (Shift Path)
        updateGraphPath();
        
    }, 1500);
}

function renderPrices() {
    // Update Main Display
    const currentPrice = state.prices[state.currentCoin];
    document.querySelector('.price-display').textContent = `$${currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('trade-price').placeholder = currentPrice.toFixed(2);

    // Update Sidebar List
    document.querySelector('.price-btc').textContent = `$${state.prices.BTC.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.querySelector('.price-eth').textContent = `$${state.prices.ETH.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

function renderOrderBook() {
    const sellContainer = document.getElementById('order-book-sells');
    const buyContainer = document.getElementById('order-book-buys');
    
    const generateRow = (type) => {
        const basePrice = state.prices[state.currentCoin];
        const price = type === 'sell' 
            ? basePrice + (Math.random() * (basePrice * 0.01)) 
            : basePrice - (Math.random() * (basePrice * 0.01));
        const amount = Math.random() * 2;
        const total = price * amount;
        const colorClass = type === 'sell' ? 'text-red-500' : 'text-green-500';
        
        return `
            <div class="flex text-xs py-1 px-4 order-row cursor-pointer hover:bg-slate-700/30">
                <span class="w-1/3 font-mono ${colorClass}">${price.toFixed(2)}</span>
                <span class="w-1/3 text-center text-gray-300">${amount.toFixed(4)}</span>
                <span class="w-1/3 text-left text-gray-400">${total.toFixed(0)}</span>
            </div>
        `;
    };

    let sellsHTML = '';
    let buysHTML = '';
    for(let i=0; i<8; i++) sellsHTML += generateRow('sell');
    for(let i=0; i<8; i++) buysHTML += generateRow('buy');

    sellContainer.innerHTML = sellsHTML;
    buyContainer.innerHTML = buysHTML;
}

function updateGraphPath() {
    // Simple wobble effect on the SVG path
    const path = document.querySelector('.chart-line');
    // In a real app, we would append data points. Here we just re-trigger animation or shift slightly
    // For this demo, let's keep it static but flash the price
    const display = document.querySelector('.price-display');
    if (Math.random() > 0.5) {
        display.classList.add('text-green-400');
        setTimeout(() => display.classList.remove('text-green-400'), 300);
    } else {
        display.classList.add('text-red-400');
        setTimeout(() => display.classList.remove('text-red-400'), 300);
    }
}

// --- Trading Logic ---
function executeTrade() {
    const amount = parseFloat(document.getElementById('trade-amount').value);
    const price = parseFloat(document.getElementById('trade-price').value) || state.prices[state.currentCoin];
    
    if (!amount || amount <= 0) {
        alert('الرجاء إدخال كمية صحيحة');
        return;
    }

    const total = amount * price;
    
    if (state.mode === 'buy') {
        if (state.wallet.USD >= total) {
            state.wallet.USD -= total;
            state.wallet[state.currentCoin] = (state.wallet[state.currentCoin] || 0) + amount;
            addHistory('شراء', amount, price, total);
            alert('تم تنفيذ عملية الشراء بنجاح! 🚀');
        } else {
            alert('رصيد غير كافٍ! ⚠️');
        }
    } else {
        if ((state.wallet[state.currentCoin] || 0) >= amount) {
            state.wallet.USD += total;
            state.wallet[state.currentCoin] -= amount;
            addHistory('بيع', amount, price, total);
            alert('تم تنفيذ عملية البيع بنجاح! 💰');
        } else {
            alert(`رصيد ${state.currentCoin} غير كافٍ! ⚠️`);
        }
    }
    
    updateWalletUI();
}

function addHistory(type, amount, price, total) {
    const historyContainer = document.getElementById('trade-history');
    const color = type === 'شراء' ? 'text-green-500' : 'text-red-500';
    const date = new Date().toLocaleTimeString('ar-EG');
    
    const item = `
        <div class="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg animate-fade-in-down">
            <div>
                <span class="font-bold ${color}">${type} ${state.currentCoin}</span>
                <div class="text-xs text-gray-500">${date}</div>
            </div>
            <div class="text-left">
                <div class="font-mono text-white">${amount.toFixed(4)}</div>
                <div class="text-xs text-gray-400">@ ${price.toFixed(2)}</div>
            </div>
        </div>
    `;
    
    // Remove 'empty' message if exists
    if (historyContainer.children[0]?.classList.contains('text-center')) {
        historyContainer.innerHTML = '';
    }
    
    historyContainer.insertAdjacentHTML('afterbegin', item);
}

function updateWalletUI() {
    document.getElementById('total-balance').textContent = `$${state.wallet.USD.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('wallet-usd').textContent = `$${state.wallet.USD.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}
