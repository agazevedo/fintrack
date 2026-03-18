from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import BudgetItem
from .serializers import BudgetItemSerializer

class BudgetItemViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BudgetItemSerializer

    def get_queryset(self):
        return BudgetItem.objects.filter(user=self.request.user).prefetch_related("expenses")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
