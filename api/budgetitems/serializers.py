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

    def validate(self, data):
        user = self.context['request'].user

        queryset = BudgetItem.objects.filter(
            user=user,
            category=data['category'],
            description=data['description']
        )

        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError(
                "There is already an item with this description in this category."
            )

        return data
