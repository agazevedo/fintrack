from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(ModelViewSet):
	permission_classes = [IsAuthenticated]
	serializer_class = ExpenseSerializer

	def get_queryset(self):
		return Expense.objects.filter(budget_item_user=self.request.user)
