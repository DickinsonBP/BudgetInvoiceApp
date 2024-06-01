from typing import Any
from django.db import models
import BudgetInvoiceApp.settings as settings

# Create your models here.
class Client(models.Model):
    nif = models.CharField(max_length=10, db_index=True, null=True, blank=True)
    name = models.CharField(max_length=255, db_index=True, blank=True)
    address = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    email = models.EmailField(max_length=255, db_index=True, null=True, blank=True)
    phone = models.CharField(max_length=255, null=True, blank=True)
    
class Budget(models.Model):
    title = models.CharField(max_length=255, db_index=True)
    date = models.DateField(null=True, blank=True)
    data = models.JSONField()
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True, default=0.00)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    approved = models.BooleanField(default=False, null=True, blank=True)
    vat = models.IntegerField(default=21)
    doc_number = models.CharField(max_length=20, null=True, blank=True)

class Invoice(models.Model):
    title = models.CharField(max_length=255, db_index=True)
    date = models.DateField(null=True, blank=True)
    data = models.JSONField()
    status = models.BooleanField(default=False, null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    budget = models.ForeignKey(Budget, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True, default=0.00)
    vat = models.IntegerField(default=21)
    doc_number = models.CharField(max_length=20, null=True, blank=True)
