// Configuration de l'API
const API_BASE = '/api';

// Éléments DOM
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const notification = document.getElementById('notification');

// Navigation mobile
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Fermer le menu mobile lors du clic sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Fonction pour afficher les notifications
function showNotification(message, type = 'success') {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Fonction pour charger les données du produit
async function loadProductData() {
    try {
        const response = await fetch(`${API_BASE}/product`);
        if (response.ok) {
            const product = await response.json();
            
            // Mettre à jour les éléments de la page
            const productName = document.getElementById('product-name');
            const productPrice = document.getElementById('product-price');
            const productDescription = document.getElementById('product-description');
            const productBenefits = document.getElementById('product-benefits');
            const productIngredients = document.getElementById('product-ingredients');
            
            if (productName) productName.textContent = product.name;
            if (productPrice) productPrice.textContent = `${product.price} €`;
            if (productDescription) productDescription.textContent = product.description;
            if (productBenefits) productBenefits.textContent = product.benefits;
            if (productIngredients) productIngredients.textContent = product.ingredients;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données du produit:', error);
    }
}

// Fonction pour charger les témoignages
async function loadTestimonials() {
    try {
        const response = await fetch(`${API_BASE}/testimonials`);
        if (response.ok) {
            const testimonials = await response.json();
            const container = document.getElementById('testimonials-container');
            
            if (container && testimonials.length > 0) {
                container.innerHTML = '';
                
                testimonials.forEach(testimonial => {
                    const testimonialCard = document.createElement('div');
                    testimonialCard.className = 'testimonial-card fade-in';
                    
                    const stars = '★'.repeat(testimonial.rating);
                    
                    testimonialCard.innerHTML = `
                        <div class="testimonial-content">
                            <div class="stars">${stars}</div>
                            <p>"${testimonial.content}"</p>
                            <div class="testimonial-author">
                                <strong>${testimonial.name}</strong>
                            </div>
                        </div>
                    `;
                    
                    container.appendChild(testimonialCard);
                });
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
    }
}

// Gestion du formulaire de commande
const orderForm = document.getElementById('order-form');
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(orderForm);
        const orderData = {
            name: formData.get('name'),
            email: formData.get('email'),
            address: formData.get('address'),
            quantity: parseInt(formData.get('quantity'))
        };
        
        try {
            orderForm.classList.add('loading');
            
            const response = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (response.ok) {
                showNotification('Votre commande a été enregistrée avec succès ! Nous vous contactons bientôt.', 'success');
                orderForm.reset();
            } else {
                const error = await response.json();
                showNotification(error.message || 'Erreur lors de l\'enregistrement de la commande', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            orderForm.classList.remove('loading');
        }
    });
}

// Gestion du formulaire de contact
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        
        try {
            contactForm.classList.add('loading');
            
            const response = await fetch(`${API_BASE}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactData)
            });
            
            if (response.ok) {
                showNotification('Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.', 'success');
                contactForm.reset();
            } else {
                const error = await response.json();
                showNotification(error.message || 'Erreur lors de l\'envoi du message', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            contactForm.classList.remove('loading');
        }
    });
}

// Gestion du formulaire de sondage
const surveyForm = document.getElementById('survey-form');
if (surveyForm) {
    surveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(surveyForm);
        
        // Récupérer les valeurs des checkboxes
        const skinProblems = Array.from(formData.getAll('skin_problems')).join(', ');
        const soapInterest = Array.from(formData.getAll('soap_interest')).join(', ');
        const importantValues = Array.from(formData.getAll('important_values')).join(', ');
        
        const surveyData = {
            buying_habits: formData.get('buying_habits'),
            skin_problems: skinProblems,
            soap_interest: soapInterest,
            ingredients_importance: formData.get('ingredients_importance'),
            acceptable_price: formData.get('acceptable_price'),
            important_values: importantValues,
            preferred_communication: formData.get('preferred_communication'),
            ideal_soap_description: formData.get('ideal_soap_description') || ''
        };
        
        // Validation
        if (!surveyData.buying_habits || !surveyData.skin_problems || !surveyData.soap_interest || 
            !surveyData.ingredients_importance || !surveyData.acceptable_price || 
            !surveyData.important_values || !surveyData.preferred_communication) {
            showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }
        
        try {
            surveyForm.classList.add('loading');
            
            const response = await fetch(`${API_BASE}/survey`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(surveyData)
            });
            
            if (response.ok) {
                showNotification('Merci pour votre participation ! Vos réponses nous aideront à améliorer nos produits.', 'success');
                surveyForm.reset();
                
                // Scroll vers le haut après soumission
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 2000);
            } else {
                const error = await response.json();
                showNotification(error.message || 'Erreur lors de l\'envoi du sondage', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        } finally {
            surveyForm.classList.remove('loading');
        }
    });
}

// Smooth scrolling pour les liens d'ancrage
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animation au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observer les éléments à animer
document.querySelectorAll('.benefit-card, .ingredient-card, .testimonial-card').forEach(el => {
    observer.observe(el);
});

// Navbar scroll effect
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scroll vers le bas
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scroll vers le haut
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Charger les données au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadProductData();
    loadTestimonials();
});

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
});

// Fonction utilitaire pour valider les emails
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validation en temps réel des emails
document.querySelectorAll('input[type="email"]').forEach(emailInput => {
    emailInput.addEventListener('blur', function() {
        if (this.value && !isValidEmail(this.value)) {
            this.style.borderColor = '#dc3545';
            showNotification('Veuillez entrer une adresse email valide.', 'error');
        } else {
            this.style.borderColor = '';
        }
    });
});

// Fonction pour formater les numéros de téléphone (si nécessaire)
function formatPhoneNumber(phone) {
    return phone.replace(/\D/g, '').replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}

// Gestion du localStorage pour sauvegarder les données de formulaire
function saveFormData(formId, data) {
    localStorage.setItem(`form_${formId}`, JSON.stringify(data));
}

function loadFormData(formId) {
    const saved = localStorage.getItem(`form_${formId}`);
    return saved ? JSON.parse(saved) : null;
}

function clearFormData(formId) {
    localStorage.removeItem(`form_${formId}`);
}

// Auto-sauvegarde des formulaires
document.querySelectorAll('form').forEach(form => {
    const formId = form.id;
    if (!formId) return;
    
    // Charger les données sauvegardées
    const savedData = loadFormData(formId);
    if (savedData) {
        Object.keys(savedData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.type !== 'radio' && input.type !== 'checkbox') {
                input.value = savedData[key];
            }
        });
    }
    
    // Sauvegarder lors de la saisie
    form.addEventListener('input', () => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        saveFormData(formId, data);
    });
    
    // Effacer lors de la soumission réussie
    form.addEventListener('submit', () => {
        setTimeout(() => {
            if (!form.classList.contains('loading')) {
                clearFormData(formId);
            }
        }, 1000);
    });
});

