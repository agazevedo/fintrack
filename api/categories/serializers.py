from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = '__all__'
		read_only_fields = ['user']

	def validate(self, data):
		user = self.context['request'].user

		if Category.objects.filter(
			user=user,
			name__iexact=data['name']
		).exists():
			raise serializers.ValidationError("Category already exists.")

		return data
