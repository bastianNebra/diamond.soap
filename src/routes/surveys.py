from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.survey import Survey

surveys_bp = Blueprint('surveys', __name__)

@surveys_bp.route('/surveys', methods=['GET'])
def get_surveys():
    """Récupérer tous les sondages"""
    try:
        surveys = Survey.query.order_by(Survey.created_at.desc()).all()
        return jsonify([survey.to_dict() for survey in surveys]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@surveys_bp.route('/survey', methods=['POST'])
def create_survey():
    """Créer une nouvelle réponse de sondage"""
    try:
        data = request.get_json()
        
        # Validation des données
        required_fields = [
            'buying_habits', 'skin_problems', 'soap_interest', 
            'ingredients_importance', 'acceptable_price', 
            'important_values', 'preferred_communication'
        ]
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        # Créer la réponse de sondage
        survey = Survey(
            buying_habits=data['buying_habits'],
            skin_problems=data['skin_problems'],
            soap_interest=data['soap_interest'],
            ingredients_importance=data['ingredients_importance'],
            acceptable_price=data['acceptable_price'],
            important_values=data['important_values'],
            preferred_communication=data['preferred_communication'],
            ideal_soap_description=data.get('ideal_soap_description', '')
        )
        
        db.session.add(survey)
        db.session.commit()
        
        return jsonify({
            'message': 'Sondage enregistré avec succès',
            'survey': survey.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@surveys_bp.route('/surveys/<int:survey_id>', methods=['GET'])
def get_survey(survey_id):
    """Récupérer un sondage spécifique"""
    try:
        survey = Survey.query.get(survey_id)
        if not survey:
            return jsonify({'error': 'Sondage non trouvé'}), 404
        
        return jsonify(survey.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@surveys_bp.route('/surveys/<int:survey_id>', methods=['DELETE'])
def delete_survey(survey_id):
    """Supprimer un sondage"""
    try:
        survey = Survey.query.get(survey_id)
        if not survey:
            return jsonify({'error': 'Sondage non trouvé'}), 404
        
        db.session.delete(survey)
        db.session.commit()
        
        return jsonify({'message': 'Sondage supprimé avec succès'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@surveys_bp.route('/surveys/stats', methods=['GET'])
def get_survey_stats():
    """Récupérer les statistiques des sondages"""
    try:
        surveys = Survey.query.all()
        
        # Analyser les données
        stats = {
            'total_responses': len(surveys),
            'buying_habits': {},
            'skin_problems': {},
            'acceptable_price': {},
            'ingredients_importance': {},
            'preferred_communication': {}
        }
        
        for survey in surveys:
            # Compter les habitudes d'achat
            habit = survey.buying_habits
            stats['buying_habits'][habit] = stats['buying_habits'].get(habit, 0) + 1
            
            # Compter les prix acceptables
            price = survey.acceptable_price
            stats['acceptable_price'][price] = stats['acceptable_price'].get(price, 0) + 1
            
            # Compter l'importance des ingrédients
            importance = survey.ingredients_importance
            stats['ingredients_importance'][importance] = stats['ingredients_importance'].get(importance, 0) + 1
            
            # Compter la communication préférée
            comm = survey.preferred_communication
            stats['preferred_communication'][comm] = stats['preferred_communication'].get(comm, 0) + 1
            
            # Analyser les problèmes de peau (peuvent être multiples)
            problems = survey.skin_problems.split(', ')
            for problem in problems:
                problem = problem.strip()
                if problem:
                    stats['skin_problems'][problem] = stats['skin_problems'].get(problem, 0) + 1
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

