from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.testimonial import Testimonial

testimonials_bp = Blueprint('testimonials', __name__)

@testimonials_bp.route('/testimonials', methods=['GET'])
def get_active_testimonials():
    """Récupérer tous les témoignages actifs (pour le site public)"""
    try:
        testimonials = Testimonial.query.filter_by(is_active=True).order_by(Testimonial.created_at.desc()).all()
        return jsonify([testimonial.to_dict() for testimonial in testimonials]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@testimonials_bp.route('/testimonials/all', methods=['GET'])
def get_all_testimonials():
    """Récupérer tous les témoignages (pour l'admin)"""
    try:
        testimonials = Testimonial.query.order_by(Testimonial.created_at.desc()).all()
        return jsonify([testimonial.to_dict() for testimonial in testimonials]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@testimonials_bp.route('/testimonials', methods=['POST'])
def create_testimonial():
    """Créer un nouveau témoignage"""
    try:
        data = request.get_json()
        
        # Validation des données
        required_fields = ['name', 'content', 'rating']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        # Validation du nom
        if not data['name'].strip():
            return jsonify({'error': 'Le nom est requis'}), 400
        
        # Validation du contenu
        if not data['content'].strip() or len(data['content'].strip()) < 10:
            return jsonify({'error': 'Le contenu doit contenir au moins 10 caractères'}), 400
        
        # Validation de la note
        try:
            rating = int(data['rating'])
            if rating < 1 or rating > 5:
                return jsonify({'error': 'La note doit être entre 1 et 5'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'La note doit être un nombre entier'}), 400
        
        # Créer le témoignage
        testimonial = Testimonial(
            name=data['name'].strip(),
            content=data['content'].strip(),
            rating=rating,
            is_active=data.get('is_active', True)
        )
        
        db.session.add(testimonial)
        db.session.commit()
        
        return jsonify({
            'message': 'Témoignage créé avec succès',
            'testimonial': testimonial.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@testimonials_bp.route('/testimonials/<int:testimonial_id>', methods=['GET'])
def get_testimonial(testimonial_id):
    """Récupérer un témoignage spécifique"""
    try:
        testimonial = Testimonial.query.get(testimonial_id)
        if not testimonial:
            return jsonify({'error': 'Témoignage non trouvé'}), 404
        
        return jsonify(testimonial.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@testimonials_bp.route('/testimonials/<int:testimonial_id>', methods=['PUT'])
def update_testimonial(testimonial_id):
    """Mettre à jour un témoignage"""
    try:
        testimonial = Testimonial.query.get(testimonial_id)
        if not testimonial:
            return jsonify({'error': 'Témoignage non trouvé'}), 404
        
        data = request.get_json()
        
        # Validation des données
        if 'name' in data:
            if not data['name'].strip():
                return jsonify({'error': 'Le nom ne peut pas être vide'}), 400
            testimonial.name = data['name'].strip()
        
        if 'content' in data:
            if not data['content'].strip() or len(data['content'].strip()) < 10:
                return jsonify({'error': 'Le contenu doit contenir au moins 10 caractères'}), 400
            testimonial.content = data['content'].strip()
        
        if 'rating' in data:
            try:
                rating = int(data['rating'])
                if rating < 1 or rating > 5:
                    return jsonify({'error': 'La note doit être entre 1 et 5'}), 400
                testimonial.rating = rating
            except (ValueError, TypeError):
                return jsonify({'error': 'La note doit être un nombre entier'}), 400
        
        if 'is_active' in data:
            testimonial.is_active = bool(data['is_active'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Témoignage mis à jour avec succès',
            'testimonial': testimonial.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@testimonials_bp.route('/testimonials/<int:testimonial_id>', methods=['DELETE'])
def delete_testimonial(testimonial_id):
    """Supprimer un témoignage"""
    try:
        testimonial = Testimonial.query.get(testimonial_id)
        if not testimonial:
            return jsonify({'error': 'Témoignage non trouvé'}), 404
        
        db.session.delete(testimonial)
        db.session.commit()
        
        return jsonify({'message': 'Témoignage supprimé avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@testimonials_bp.route('/testimonials/<int:testimonial_id>/toggle', methods=['PUT'])
def toggle_testimonial_status(testimonial_id):
    """Activer/désactiver un témoignage"""
    try:
        testimonial = Testimonial.query.get(testimonial_id)
        if not testimonial:
            return jsonify({'error': 'Témoignage non trouvé'}), 404
        
        testimonial.is_active = not testimonial.is_active
        db.session.commit()
        
        status = 'activé' if testimonial.is_active else 'désactivé'
        return jsonify({
            'message': f'Témoignage {status} avec succès',
            'testimonial': testimonial.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

