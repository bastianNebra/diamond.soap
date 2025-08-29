from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.order import Order

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/orders', methods=['GET'])
def get_orders():
    """Récupérer toutes les commandes"""
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        return jsonify([order.to_dict() for order in orders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders', methods=['POST'])
def create_order():
    """Créer une nouvelle commande"""
    try:
        data = request.get_json()
        
        # Validation des données
        required_fields = ['name', 'email', 'address', 'quantity']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        # Validation de la quantité
        if not isinstance(data['quantity'], int) or data['quantity'] <= 0:
            return jsonify({'error': 'La quantité doit être un nombre entier positif'}), 400
        
        # Validation de l'email
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, data['email']):
            return jsonify({'error': 'Adresse email invalide'}), 400
        
        # Créer la commande
        order = Order(
            name=data['name'].strip(),
            email=data['email'].strip().lower(),
            address=data['address'].strip(),
            quantity=data['quantity']
        )
        
        db.session.add(order)
        db.session.commit()
        
        return jsonify({
            'message': 'Commande créée avec succès',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Récupérer une commande spécifique"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Commande non trouvée'}), 404
        
        return jsonify(order.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Supprimer une commande"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Commande non trouvée'}), 404
        
        db.session.delete(order)
        db.session.commit()
        
        return jsonify({'message': 'Commande supprimée avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

