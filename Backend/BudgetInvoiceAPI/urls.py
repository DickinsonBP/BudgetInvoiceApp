from django.urls import path
from . import views

from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('api-token-auth', obtain_auth_token),
    path('clients', views.ClientListView.as_view()),
    path('clients/<int:pk>', views.SingleClientView.as_view()),
    path('budgets', views.BudgetView.as_view()),
    path('budgets/<int:pk>', views.SingleBudgetView.as_view()),
    path('budgets/<int:pk>/pdf', views.budget_pdf),
    path('invoices', views.InvoiceView.as_view()),
    path('invoices/<int:pk>', views.SingleInvoiceView.as_view()),
    path('invoices/<int:pk>/pdf', views.invoice_pdf),
]