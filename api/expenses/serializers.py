from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
	total = serializers.ReadOnlyField()
	budget_item_name = serializers.CharField(source='budget_item.description', read_only=True)

	class Meta:
		model = Expense
		fields = '__all__'
		read_only_fields = ['user']

	def validate_budget_item(self, value):
		user = self.context['request'].user

		if value.user_id != user.id:
			raise serializers.ValidationError("Budget item must belong to the authenticated user.")
		return value

	def validate(self, data):
		queryset = Expense.objects.filter(
			budget_item=data['budget_item'],
			date=data['date'],
		)

		if self.instance:
			queryset = queryset.exclude(id=self.instance.id)

		if queryset.exists():
			raise serializers.ValidationError("Duplicate expense.")

		return data
