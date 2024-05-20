from django.db import models

# Create your models here.
class Client(models.Model):
    nif = models.CharField(max_length=10, db_index=True, null=True, blank=True)
    name = models.CharField(max_length=255, db_index=True, blank=True)
    address = models.CharField(max_length=255, db_index=True, null=True, blank=True)
    email = models.EmailField(max_length=255, db_index=True, null=True, blank=True)
    phone = models.CharField(max_length=255, null=True, blank=True)
    
class Budget(models.Model):
    title = models.CharField(max_length=255, db_index=True)
    # date = models.DateField()
    data = models.JSONField()
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True, default=0.00)
    client = models.ForeignKey(Client, on_delete=models.PROTECT)

class Invoice(models.Model):
    title = models.CharField(max_length=255, db_index=True)
    # date = models.DateField()
    data = models.JSONField()
    status = models.BooleanField(default=False, null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.PROTECT)
    budget = models.ForeignKey(Budget, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True, default=0.00)
    vat = models.IntegerField(default=21)
