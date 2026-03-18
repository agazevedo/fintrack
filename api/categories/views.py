from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(ModelViewSet):
	permission_classes = [IsAuthenticated]
	serializer_class = CategorySerializer

	def get_queryset(self):
		return Category.objects.filter(user=self.request.user)
	
	def perform_create(self, serializer):
		serializer.save(user=self.request.user)
