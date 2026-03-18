from django.db import models
from django.contrib.auth.models import User

class BudgetItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)

    description = models.CharField(max_length=255)
    unit_value = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def budget_total(self):
        return self.unit_value * self.quantity
    
    @property
    def spent(self):
        return sum(exp.total for exp in self.expenses.all())
    
    @property
    def remaining(self):
        return self.budget_total - self.spent
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'category', 'description'],
                name='unique_budget_per_user_category_description'
            )
        ]

    def __str__(self):
        return f"{self.description} - {self.quantity} - {self.category}"
