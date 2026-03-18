from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
	total = serializers.ReadOnlyField()

	class Meta:
		model = Expense
		fields = '__all__'

	def validate_budget_item(self, value):
		user = self.context['request'].user

		if value.user != user:
			raise serializers.ValidationError("Budget item must belong to the authenticated user.")
		return value
