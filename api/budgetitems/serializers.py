from rest_framework import serializers
from .models import BudgetItem

class BudgetItemSerializer(serializers.ModelSerializer):
    budget_total = serializers.ReadOnlyField()
    spent = serializers.ReadOnlyField()
    remaining = serializers.ReadOnlyField()
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = BudgetItem
        fields = '__all__'
        read_only_fields = ['user']
