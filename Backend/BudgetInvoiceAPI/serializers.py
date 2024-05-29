from rest_framework import serializers
from .models import *
from decimal import Decimal

import bleach

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id','nif','name','address','email','phone']
        extra_kwargs = {
            'nif': {'allow_null': True, 'required': False},
            'address': {'allow_null': True, 'required': False},
            'email': {'allow_null': True, 'required': False},
            'phone': {'allow_null': True, 'required': False},
        }
        
class BudgetSerializer(serializers.ModelSerializer):

    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all())
    class Meta:
        model = Budget
        fields = ['id','title','data','price','client','approved','vat','date']
        extra_kwargs = {
            'approved': {'allow_null': True, 'required': False},
            'vat': {'allow_null': True, 'required': False},
        }

class InvoiceSerializer(serializers.ModelSerializer):

    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all())
    budget = serializers.PrimaryKeyRelatedField(queryset=Budget.objects.all())
    class Meta:
        model = Invoice
        fields = ['id','title','data','client','budget','price','vat','status','date']
        extra_kwargs = {
            'budget': {'allow_null': True, 'required': False},
            'status': {'allow_null': True, 'required': False},
        }