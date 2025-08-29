from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.product import Product

products_bp = Blueprint('products', __name__)

@products_bp.route('/product', methods=['GET'])
def get_product():
    """Récupérer les informations du produit principal"""
    try:
        # Récupérer le premier produit ou créer un produit par défaut
        product = Product.query.first()
        
        if not product:
            # Créer un produit par défaut s'il n'en existe pas
            product = Product()
            db.session.add(product)
            db.session.commit()
        
        return jsonify(product.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/product', methods=['PUT'])
def update_product():
    """Mettre à jour les informations du produit"""
    try:
        data = request.get_json()
        
        # Récupérer le produit existant ou créer un nouveau
        product = Product.query.first()
        if not product:
            product = Product()
            db.session.add(product)
        
        # Validation et mise à jour des champs
        if 'name' in data:
            if not data['name'].strip():
                return jsonify({'error': 'Le nom du produit ne peut pas être vide'}), 400
            product.name = data['name'].strip()
        
        if 'description' in data:
            if not data['description'].strip():
                return jsonify({'error': 'La description ne peut pas être vide'}), 400
            product.description = data['description'].strip()
        
        if 'price' in data:
            try:
                price = float(data['price'])
                if price <= 0:
                    return jsonify({'error': 'Le prix doit être positif'}), 400
                product.price = price
            except (ValueError, TypeError):
                return jsonify({'error': 'Le prix doit être un nombre valide'}), 400
        
        if 'ingredients' in data:
            if not data['ingredients'].strip():
                return jsonify({'error': 'Les ingrédients ne peuvent pas être vides'}), 400
            product.ingredients = data['ingredients'].strip()
        
        if 'benefits' in data:
            if not data['benefits'].strip():
                return jsonify({'error': 'Les bénéfices ne peuvent pas être vides'}), 400
            product.benefits = data['benefits'].strip()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Produit mis à jour avec succès',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/product/history', methods=['GET'])
def get_product_history():
    """Récupérer l'historique des modifications du produit (fonctionnalité future)"""
    try:
        # Pour l'instant, on retourne juste le produit actuel
        # Dans une version future, on pourrait implémenter un système de versioning
        product = Product.query.first()
        
        if not product:
            return jsonify({'error': 'Aucun produit trouvé'}), 404
        
        return jsonify({
            'current': product.to_dict(),
            'history': []  # Placeholder pour l'historique futur
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/product/validate', methods=['POST'])
def validate_product_data():
    """Valider les données du produit sans les sauvegarder"""
    try:
        data = request.get_json()
        errors = []
        
        # Validation du nom
        if 'name' in data and not data['name'].strip():
            errors.append('Le nom du produit ne peut pas être vide')
        
        # Validation de la description
        if 'description' in data and not data['description'].strip():
            errors.append('La description ne peut pas être vide')
        
        # Validation du prix
        if 'price' in data:
            try:
                price = float(data['price'])
                if price <= 0:
                    errors.append('Le prix doit être positif')
            except (ValueError, TypeError):
                errors.append('Le prix doit être un nombre valide')
        
        # Validation des ingrédients
        if 'ingredients' in data and not data['ingredients'].strip():
            errors.append('Les ingrédients ne peuvent pas être vides')
        
        # Validation des bénéfices
        if 'benefits' in data and not data['benefits'].strip():
            errors.append('Les bénéfices ne peuvent pas être vides')
        
        if errors:
            return jsonify({'valid': False, 'errors': errors}), 400
        
        return jsonify({'valid': True, 'message': 'Données valides'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

