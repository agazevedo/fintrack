from rest_framework.routers import DefaultRouter
from django.urls import include, path
from api.budgetitems.views import BudgetItemViewSet
from api.categories.views import CategoryViewSet
from api.expenses.views import ExpenseViewSet
from .auth.views import RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'budget-items', BudgetItemViewSet, basename='budgetitem')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),

    # authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
]
