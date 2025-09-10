// Utility Functions
const QuantumUtils = {
    // Update quantum time
    updateQuantumTime() {
        const now = new Date();
        const timeString = now.toUTCString().split(' ')[4];
        const timeElement = document.getElementById('quantumTime');
        if (timeElement) {
            timeElement.textContent = timeString + ' UTC';
        }
    },
    
    // Random quantum value generator
    generateQuantumValue(base, variance) {
        return base + (Math.random() - 0.5) * variance;
    },
    
    // Format numbers with quantum styling
    formatQuantumNumber(value, decimals = 1) {
        return parseFloat(value).toFixed(decimals);
    }
};

// Initialize utilities
setInterval(QuantumUtils.updateQuantumTime, 1000);