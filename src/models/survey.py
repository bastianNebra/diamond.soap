from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Survey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    buying_habits = db.Column(db.String(100), nullable=False)
    skin_problems = db.Column(db.String(200), nullable=False)
    soap_interest = db.Column(db.String(200), nullable=False)
    ingredients_importance = db.Column(db.String(100), nullable=False)
    acceptable_price = db.Column(db.String(50), nullable=False)
    important_values = db.Column(db.String(200), nullable=False)
    preferred_communication = db.Column(db.String(100), nullable=False)
    ideal_soap_description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Survey {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'buying_habits': self.buying_habits,
            'skin_problems': self.skin_problems,
            'soap_interest': self.soap_interest,
            'ingredients_importance': self.ingredients_importance,
            'acceptable_price': self.acceptable_price,
            'important_values': self.important_values,
            'preferred_communication': self.preferred_communication,
            'ideal_soap_description': self.ideal_soap_description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

