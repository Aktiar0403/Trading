export class TradingChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.candleSeries = null;
        this.volumeSeries = null;
        this.currentSymbol = 'BTC/USD';
        this.timeframe = '1h';
        this.isConnected = false;
        
        this.initializeChart();
    }

    initializeChart() {
        if (!this.container) {
            console.error('Trading chart container not found');
            return;
        }

        // Create the chart
        this.chart = LightweightCharts.createChart(this.container, {
            width: this.container.clientWidth,
            height: 400,
            layout: {
                backgroundColor: '#ffffff',
                textColor: '#1e293b',
            },
            grid: {
                vertLines: {
                    color: '#e2e8f0',
                },
                horzLines: {
                    color: '#e2e8f0',
                },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: '#e2e8f0',
            },
            timeScale: {
                borderColor: '#e2e8f0',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Add candlestick series
        this.candleSeries = this.chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#10b981',
            wickDownColor: '#ef4444',
            wickUpColor: '#10b981',
        });

        // Add volume series
        this.volumeSeries = this.chart.addHistogramSeries({
            color: '#3b82f6',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        // Generate sample data
        this.generateSampleData();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        console.log('Trading chart initialized');
    }

    generateSampleData() {
        const sampleData = this.createSampleCandleData(100);
        const volumeData = this.createSampleVolumeData(sampleData);
        
        this.candleSeries.setData(sampleData);
        this.volumeSeries.setData(volumeData);
    }

    createSampleCandleData(count) {
        const data = [];
        let time = new Date();
        time.setHours(0, 0, 0, 0);
        time.setTime(time.getTime() - count * 60 * 60 * 1000); // Go back in time

        let price = 50000; // Starting price for BTC

        for (let i = 0; i < count; i++) {
            const volatility = 0.02; // 2% volatility
            const open = price;
            const close = open * (1 + (Math.random() - 0.5) * volatility);
            const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
            const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

            data.push({
                time: time.getTime() / 1000,
                open: open,
                high: high,
                low: low,
                close: close,
            });

            price = close;
            time.setTime(time.getTime() + 60 * 60 * 1000); // Move forward 1 hour
        }

        return data;
    }

    createSampleVolumeData(candleData) {
        return candleData.map(candle => ({
            time: candle.time,
            value: Math.random() * 1000 + 500, // Random volume between 500-1500
            color: candle.close >= candle.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
        }));
    }

    updateChart(symbol, timeframe) {
        this.currentSymbol = symbol;
        this.timeframe = timeframe;
        
        // In a real app, you would fetch real market data here
        // For now, we'll regenerate sample data
        this.generateSampleData();
        
        console.log(`Chart updated: ${symbol} - ${timeframe}`);
    }

    addTradeMarker(time, price, type, size) {
        const marker = {
            time: time,
            position: 'aboveBar',
            color: type === 'buy' ? '#10b981' : '#ef4444',
            shape: type === 'buy' ? 'arrowUp' : 'arrowDown',
            text: `${type.toUpperCase()} ${size}`,
        };

        this.candleSeries.setMarkers([marker]);
    }

    handleResize() {
        if (this.chart && this.container) {
            this.chart.applyOptions({
                width: this.container.clientWidth,
            });
        }
    }

    destroy() {
        if (this.chart) {
            this.chart.remove();
            this.chart = null;
        }
    }
}