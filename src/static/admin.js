// Configuration
const ADMIN_PASSWORD = 'admin123'; // Mot de passe simple pour la démo
// const API_BASE = '/api';

// État de l'authentification
let isAuthenticated = false;

// Éléments DOM
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// Gestion de la connexion
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
        loginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAllData();
        showNotification('Connexion réussie !', 'success');
    } else {
        loginError.textContent = 'Mot de passe incorrect';
        loginError.style.display = 'block';
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 3000);
    }
});

// Déconnexion
function logout() {
    isAuthenticated = false;
    loginSection.style.display = 'block';
    adminPanel.style.display = 'none';
    document.getElementById('admin-password').value = '';
}

// Navigation entre les sections
function showSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Désactiver tous les boutons
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher la section sélectionnée
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Activer le bouton correspondant
    event.target.classList.add('active');
}

// Charger toutes les données
async function loadAllData() {
    await Promise.all([
        loadOrders(),
        loadSurveys(),
        loadContacts(),
        loadTestimonials(),
        loadProduct(),
        loadStats()
    ]);
}

// Charger les statistiques
async function loadStats() {
    try {
        const [ordersRes, surveysRes, contactsRes, testimonialsRes] = await Promise.all([
            fetch(`${API_BASE}/orders`),
            fetch(`${API_BASE}/surveys`),
            fetch(`${API_BASE}/contacts`),
            fetch(`${API_BASE}/testimonials`)
        ]);
        
        const orders = ordersRes.ok ? await ordersRes.json() : [];
        const surveys = surveysRes.ok ? await surveysRes.json() : [];
        const contacts = contactsRes.ok ? await contactsRes.json() : [];
        const testimonials = testimonialsRes.ok ? await testimonialsRes.json() : [];
        
        document.getElementById('orders-count').textContent = orders.length;
        document.getElementById('surveys-count').textContent = surveys.length;
        document.getElementById('contacts-count').textContent = contacts.length;
        document.getElementById('testimonials-count').textContent = testimonials.length;
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Charger les commandes
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        if (response.ok) {
            const orders = await response.json();
            const tbody = document.getElementById('orders-table-body');
            
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.name}</td>
                    <td>${order.email}</td>
                    <td>${order.address}</td>
                    <td>${order.quantity}</td>
                    <td>${new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
    }
}

// Charger les sondages
async function loadSurveys() {
    try {
        const response = await fetch(`${API_BASE}/surveys`);
        if (response.ok) {
            const surveys = await response.json();
            const tbody = document.getElementById('surveys-table-body');
            
            tbody.innerHTML = surveys.map(survey => `
                <tr>
                    <td>${survey.id}</td>
                    <td>${survey.buying_habits}</td>
                    <td>${survey.skin_problems}</td>
                    <td>${survey.acceptable_price}</td>
                    <td>${new Date(survey.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-small btn-edit" onclick="showSurveyDetails(${survey.id})">
                                <i class="fas fa-eye"></i> Voir
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des sondages:', error);
    }
}

// Charger les messages de contact
async function loadContacts() {
    try {
        const response = await fetch(`${API_BASE}/contacts`);
        if (response.ok) {
            const contacts = await response.json();
            const tbody = document.getElementById('contacts-table-body');
            
            tbody.innerHTML = contacts.map(contact => `
                <tr>
                    <td>${contact.id}</td>
                    <td>${contact.name}</td>
                    <td>${contact.email}</td>
                    <td>${contact.message.substring(0, 100)}${contact.message.length > 100 ? '...' : ''}</td>
                    <td>${new Date(contact.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
    }
}

// Charger les témoignages
async function loadTestimonials() {
    try {
        const response = await fetch(`${API_BASE}/testimonials/all`);
        if (response.ok) {
            const testimonials = await response.json();
            const tbody = document.getElementById('testimonials-table-body');
            
            tbody.innerHTML = testimonials.map(testimonial => `
                <tr>
                    <td>${testimonial.id}</td>
                    <td>${testimonial.name}</td>
                    <td>${testimonial.content.substring(0, 100)}${testimonial.content.length > 100 ? '...' : ''}</td>
                    <td>${'★'.repeat(testimonial.rating)}</td>
                    <td>
                        <span style="color: ${testimonial.is_active ? 'green' : 'red'}">
                            ${testimonial.is_active ? 'Oui' : 'Non'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-small btn-edit" onclick="editTestimonial(${testimonial.id})">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                            <button class="btn-small btn-delete" onclick="deleteTestimonial(${testimonial.id})">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des témoignages:', error);
    }
}

// Charger les données du produit
async function loadProduct() {
    try {
        const response = await fetch(`${API_BASE}/product`);
        if (response.ok) {
            const product = await response.json();
            
            document.getElementById('product-name-input').value = product.name;
            document.getElementById('product-description-input').value = product.description;
            document.getElementById('product-price-input').value = product.price;
            document.getElementById('product-ingredients-input').value = product.ingredients;
            document.getElementById('product-benefits-input').value = product.benefits;
        }
    } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
    }
}

// Gestion du formulaire produit
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        ingredients: formData.get('ingredients'),
        benefits: formData.get('benefits')
    };
    
    try {
        const response = await fetch(`${API_BASE}/product`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            showNotification('Produit mis à jour avec succès !', 'success');
        } else {
            showNotification('Erreur lors de la mise à jour du produit', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    }
});

// Gestion des témoignages
function showAddTestimonialModal() {
    document.getElementById('testimonial-modal-title').textContent = 'Ajouter un témoignage';
    document.getElementById('testimonial-form').reset();
    document.getElementById('testimonial-id').value = '';
    document.getElementById('testimonial-modal').style.display = 'block';
}

async function editTestimonial(id) {
    try {
        const response = await fetch(`${API_BASE}/testimonials/all`);
        if (response.ok) {
            const testimonials = await response.json();
            const testimonial = testimonials.find(t => t.id === id);
            
            if (testimonial) {
                document.getElementById('testimonial-modal-title').textContent = 'Modifier le témoignage';
                document.getElementById('testimonial-id').value = testimonial.id;
                document.getElementById('testimonial-name').value = testimonial.name;
                document.getElementById('testimonial-content').value = testimonial.content;
                document.getElementById('testimonial-rating').value = testimonial.rating;
                document.getElementById('testimonial-active').checked = testimonial.is_active;
                document.getElementById('testimonial-modal').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement du témoignage', 'error');
    }
}

async function deleteTestimonial(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
        try {
            const response = await fetch(`${API_BASE}/testimonials/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showNotification('Témoignage supprimé avec succès !', 'success');
                loadTestimonials();
                loadStats();
            } else {
                showNotification('Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Erreur de connexion', 'error');
        }
    }
}

function closeTestimonialModal() {
    document.getElementById('testimonial-modal').style.display = 'none';
}

// Gestion du formulaire de témoignage
document.getElementById('testimonial-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const testimonialData = {
        name: formData.get('name'),
        content: formData.get('content'),
        rating: parseInt(formData.get('rating')),
        is_active: formData.get('is_active') === 'on'
    };
    
    const id = document.getElementById('testimonial-id').value;
    const isEdit = id !== '';
    
    try {
        const url = isEdit ? `${API_BASE}/testimonials/${id}` : `${API_BASE}/testimonials`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testimonialData)
        });
        
        if (response.ok) {
            showNotification(`Témoignage ${isEdit ? 'modifié' : 'ajouté'} avec succès !`, 'success');
            closeTestimonialModal();
            loadTestimonials();
            loadStats();
        } else {
            showNotification('Erreur lors de la sauvegarde', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    }
});

// Afficher les détails d'un sondage
async function showSurveyDetails(id) {
    try {
        const response = await fetch(`${API_BASE}/surveys`);
        if (response.ok) {
            const surveys = await response.json();
            const survey = surveys.find(s => s.id === id);
            
            if (survey) {
                const detailsHtml = `
                    <div style="line-height: 1.6;">
                        <p><strong>Habitudes d'achat:</strong> ${survey.buying_habits}</p>
                        <p><strong>Problèmes de peau:</strong> ${survey.skin_problems}</p>
                        <p><strong>Intérêts pour le savon:</strong> ${survey.soap_interest}</p>
                        <p><strong>Importance des ingrédients:</strong> ${survey.ingredients_importance}</p>
                        <p><strong>Prix acceptable:</strong> ${survey.acceptable_price}</p>
                        <p><strong>Valeurs importantes:</strong> ${survey.important_values}</p>
                        <p><strong>Communication préférée:</strong> ${survey.preferred_communication}</p>
                        ${survey.ideal_soap_description ? `<p><strong>Savon idéal:</strong> ${survey.ideal_soap_description}</p>` : ''}
                        <p><strong>Date:</strong> ${new Date(survey.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                `;
                
                document.getElementById('survey-details').innerHTML = detailsHtml;
                document.getElementById('survey-modal').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement des détails', 'error');
    }
}

function closeSurveyModal() {
    document.getElementById('survey-modal').style.display = 'none';
}

// Fermer les modales en cliquant à l'extérieur
window.onclick = function(event) {
    const testimonialModal = document.getElementById('testimonial-modal');
    const surveyModal = document.getElementById('survey-modal');
    
    if (event.target === testimonialModal) {
        testimonialModal.style.display = 'none';
    }
    if (event.target === surveyModal) {
        surveyModal.style.display = 'none';
    }
}

// Actualisation automatique des données toutes les 30 secondes
setInterval(() => {
    if (isAuthenticated) {
        loadStats();
    }
}, 30000);

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
});

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fonction pour exporter les données (bonus)
function exportData(type) {
    // Cette fonction pourrait être implémentée pour exporter les données en CSV
    showNotification('Fonctionnalité d\'export en cours de développement', 'info');
}

// Recherche dans les tableaux (bonus)
function addSearchFunctionality() {
    // Cette fonction pourrait ajouter une barre de recherche pour filtrer les données
    console.log('Fonctionnalité de recherche à implémenter');
}

