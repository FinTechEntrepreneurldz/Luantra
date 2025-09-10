// Quantum Particle System
class QuantumParticleSystem {
    constructor() {
        this.particles = [];
        this.container = null;
    }
    
    init() {
        this.container = document.querySelector('.quantum-particles');
        this.createParticles();
    }
    
    createParticles() {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (20 + Math.random() * 20) + 's';
            this.container.appendChild(particle);
        }
    }
}

// Initialize particle system
const particleSystem = new QuantumParticleSystem();
document.addEventListener('DOMContentLoaded', () => {
    particleSystem.init();
});