from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.contact import Contact

contacts_bp = Blueprint('contacts', __name__)

@contacts_bp.route('/contacts', methods=['GET'])
def get_contacts():
    """Récupérer tous les messages de contact"""
    try:
        contacts = Contact.query.order_by(Contact.created_at.desc()).all()
        return jsonify([contact.to_dict() for contact in contacts]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contacts_bp.route('/contact', methods=['POST'])
def create_contact():
    """Créer un nouveau message de contact"""
    try:
        data = request.get_json()
        
        # Validation des données
        required_fields = ['name', 'email', 'message']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        # Validation de l'email
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, data['email']):
            return jsonify({'error': 'Adresse email invalide'}), 400
        
        # Validation de la longueur du message
        if len(data['message'].strip()) < 10:
            return jsonify({'error': 'Le message doit contenir au moins 10 caractères'}), 400
        
        # Créer le message de contact
        contact = Contact(
            name=data['name'].strip(),
            email=data['email'].strip().lower(),
            message=data['message'].strip()
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return jsonify({
            'message': 'Message envoyé avec succès',
            'contact': contact.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contacts_bp.route('/contacts/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    """Récupérer un message de contact spécifique"""
    try:
        contact = Contact.query.get(contact_id)
        if not contact:
            return jsonify({'error': 'Message non trouvé'}), 404
        
        return jsonify(contact.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contacts_bp.route('/contacts/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """Supprimer un message de contact"""
    try:
        contact = Contact.query.get(contact_id)
        if not contact:
            return jsonify({'error': 'Message non trouvé'}), 404
        
        db.session.delete(contact)
        db.session.commit()
        
        return jsonify({'message': 'Message supprimé avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@contacts_bp.route('/contacts/<int:contact_id>/mark-read', methods=['PUT'])
def mark_contact_read(contact_id):
    """Marquer un message comme lu (fonctionnalité future)"""
    try:
        contact = Contact.query.get(contact_id)
        if not contact:
            return jsonify({'error': 'Message non trouvé'}), 404
        
        # Pour l'instant, on retourne juste le message
        # Dans une version future, on pourrait ajouter un champ 'is_read'
        return jsonify({
            'message': 'Message marqué comme lu',
            'contact': contact.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

