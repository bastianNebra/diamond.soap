from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="Diamand Soap Hydratant")
    description = db.Column(db.Text, nullable=False, default="Un savon pensé pour votre peau : hydratant, exfoliant, anti-taches & anti-acné.")
    price = db.Column(db.Float, nullable=False, default=5.99)
    ingredients = db.Column(db.Text, nullable=False, default="Niacinamide, Acides aminés, Beurre de karité, Huile d'argan")
    benefits = db.Column(db.Text, nullable=False, default="Hydratant, Exfoliant, Anti-taches, Anti-acné")
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Product {self.id} - {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'ingredients': self.ingredients,
            'benefits': self.benefits,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

