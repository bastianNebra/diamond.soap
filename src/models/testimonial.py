from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Testimonial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False, default=5)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Testimonial {self.id} - {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'content': self.content,
            'rating': self.rating,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

