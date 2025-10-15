// Remove the import since TradingChart is now global

export class TradingInterface {
    constructor() {
        this.tradingChart = null;
        this.currentPosition = null;
        this.orderHistory = [];
        this.balance = 10000; // Starting balance
        this.availableBalance = 10000;
    }

    initialize(containerId) {
        // Check if TradingChart class is available
        if (typeof TradingChart === 'undefined') {
            console.error('TradingChart class not found. Make sure trading-chart.js is loaded.');
            this.showChartError();
            return;
        }

        try {
            this.tradingChart = new TradingChart(containerId);
            this.setupTradingControls();
            this.updateBalanceDisplay();
            console.log('Trading interface initialized successfully');
        } catch (error) {
            console.error('Error initializing trading interface:', error);
            this.showChartError();
        }
    }

    showChartError() {
        const container = document.getElementById('trading-chart');
        if (container) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--error-color);">
                    <h3>Chart Loading Error</h3>
                    <p>Unable to load trading charts. Please refresh the page.</p>
                    <button class="btn-primary" onclick="location.reload()">Reload Page</button>
                </div>
            `;
        }
    }

    setupTradingControls() {
        // These will be connected to HTML elements
        const buyButton = document.getElementById('buy-button');
        const sellButton = document.getElementById('sell-button');
        const symbolSelect = document.getElementById('symbol-select');
        const timeframeSelect = document.getElementById('timeframe-select');
        const quantityInput = document.getElementById('quantity-input');

        if (buyButton) {
            buyButton.addEventListener('click', () => this.placeOrder('buy'));
        }

        if (sellButton) {
            sellButton.addEventListener('click', () => this.placeOrder('sell'));
        }

        if (symbolSelect) {
            symbolSelect.addEventListener('change', (e) => {
                this.changeSymbol(e.target.value);
            });
        }

        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', (e) => {
                this.changeTimeframe(e.target.value);
            });
        }

        // Initialize quantity input
        if (quantityInput) {
            quantityInput.addEventListener('input', () => {
                this.validateQuantity();
            });
        }
    }

    validateQuantity() {
        const quantityInput = document.getElementById('quantity-input');
        if (quantityInput) {
            const value = parseFloat(quantityInput.value);
            if (value <= 0 || isNaN(value)) {
                quantityInput.value = '0.1';
            }
        }
    }

    placeOrder(type) {
        const quantityInput = document.getElementById('quantity-input');
        const quantity = quantityInput ? parseFloat(quantityInput.value) : 0.1;
        
        if (quantity <= 0 || isNaN(quantity)) {
            alert('Please enter a valid quantity');
            return;
        }

        // Calculate position value (simplified)
        const currentPrice = this.getCurrentPrice();
        const positionValue = currentPrice * quantity;

        if (type === 'buy' && positionValue > this.availableBalance) {
            alert('Insufficient balance');
            return;
        }

        if (type === 'sell' && !this.currentPosition) {
            alert('No position to sell');
            return;
        }

        // Create order
        const order = {
            id: Date.now().toString(),
            type: type,
            symbol: this.tradingChart ? this.tradingChart.currentSymbol : 'BTC/USD',
            quantity: quantity,
            price: currentPrice,
            timestamp: new Date(),
            value: positionValue
        };

        this.executeOrder(order);
    }

    executeOrder(order) {
        if (order.type === 'buy') {
            this.currentPosition = {
                symbol: order.symbol,
                quantity: order.quantity,
                entryPrice: order.price,
                entryTime: order.timestamp
            };
            this.availableBalance -= order.value;
        } else if (order.type === 'sell' && this.currentPosition) {
            const profitLoss = (order.price - this.currentPosition.entryPrice) * order.quantity;
            this.availableBalance += order.value + profitLoss;
            this.currentPosition = null;
            
            // Record P&L
            order.profitLoss = profitLoss;
        }

        this.orderHistory.push(order);
        this.updateBalanceDisplay();
        this.updatePositionDisplay();
        this.updateOrderHistory();
        
        // Add marker to chart if chart is available
        if (this.tradingChart) {
            this.tradingChart.addTradeMarker(
                Math.floor(order.timestamp.getTime() / 1000),
                order.price,
                order.type,
                order.quantity
            );
        }

        console.log('Order executed:', order);
    }

    getCurrentPrice() {
        // In a real app, this would get the actual current price
        // For demo, return a random price around 50,000
        return 50000 + (Math.random() - 0.5) * 1000;
    }

    changeSymbol(symbol) {
        if (this.tradingChart) {
            this.tradingChart.updateChart(symbol, this.tradingChart.timeframe);
        }
    }

    changeTimeframe(timeframe) {
        if (this.tradingChart) {
            this.tradingChart.updateChart(this.tradingChart.currentSymbol, timeframe);
        }
    }

    updateBalanceDisplay() {
        const balanceElement = document.getElementById('balance-display');
        const availableBalanceElement = document.getElementById('available-balance-display');
        
        if (balanceElement) {
            balanceElement.textContent = `$${this.balance.toFixed(2)}`;
        }
        
        if (availableBalanceElement) {
            availableBalanceElement.textContent = `$${this.availableBalance.toFixed(2)}`;
        }
    }

    updatePositionDisplay() {
        const positionElement = document.getElementById('current-position');
        
        if (!positionElement) return;

        if (this.currentPosition) {
            const currentPrice = this.getCurrentPrice();
            const unrealizedPL = (currentPrice - this.currentPosition.entryPrice) * this.currentPosition.quantity;
            
            positionElement.innerHTML = `
                <div class="position-info">
                    <strong>Current Position</strong>
                    <div>Symbol: ${this.currentPosition.symbol}</div>
                    <div>Quantity: ${this.currentPosition.quantity}</div>
                    <div>Entry: $${this.currentPosition.entryPrice.toFixed(2)}</div>
                    <div>Current: $${currentPrice.toFixed(2)}</div>
                    <div class="${unrealizedPL >= 0 ? 'text-profit' : 'text-loss'}">
                        Unrealized P&L: $${unrealizedPL.toFixed(2)}
                    </div>
                </div>
            `;
        } else {
            positionElement.innerHTML = '<div>No active position</div>';
        }
    }

    updateOrderHistory() {
        const historyContainer = document.getElementById('order-history-container');
        if (!historyContainer) return;

        if (this.orderHistory.length === 0) {
            historyContainer.innerHTML = '<div>No orders yet</div>';
            return;
        }

        let html = `
            <div class="order-header order-item">
                <div>Time</div>
                <div>Type</div>
                <div>Price</div>
                <div>P&L</div>
            </div>
        `;

        // Show last 10 orders
        const recentOrders = this.orderHistory.slice(-10).reverse();
        
        recentOrders.forEach(order => {
            const time = order.timestamp.toLocaleTimeString();
            const pnl = order.profitLoss ? `$${order.profitLoss.toFixed(2)}` : '-';
            const pnlClass = order.profitLoss > 0 ? 'text-profit' : order.profitLoss < 0 ? 'text-loss' : '';
            
            html += `
                <div class="order-item">
                    <div>${time}</div>
                    <div class="${order.type === 'buy' ? 'text-profit' : 'text-loss'}">${order.type.toUpperCase()}</div>
                    <div>$${order.price.toFixed(2)}</div>
                    <div class="${pnlClass}">${pnl}</div>
                </div>
            `;
        });

        historyContainer.innerHTML = html;
    }

    getOrderHistory() {
        return this.orderHistory;
    }

    destroy() {
        if (this.tradingChart) {
            this.tradingChart.destroy();
        }
    }
}