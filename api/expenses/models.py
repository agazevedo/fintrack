from django.db import models

class Expense(models.Model):
    budget_item = models.ForeignKey('budgetitems.BudgetItem', on_delete=models.CASCADE, related_name="expenses")

    unit_value = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    date = models.DateField()

    @property
    def total(self):
        return self.unit_value * self.quantity

    def __str__(self):
        return f"{self.budget_item} - {self.quantity} - {self.unit_value} - {self.date}"
