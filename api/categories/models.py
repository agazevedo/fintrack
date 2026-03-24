from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    class Type(models.TextChoices):
        CUSTEIO = 'custeio', 'Custeio'
        CAPITAL = 'capital', 'Capital'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=Type.choices)

    def __str__(self):
        return self.name
