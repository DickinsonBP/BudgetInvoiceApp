# Generated by Django 5.0.6 on 2024-05-18 15:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('BudgetInvoiceAPI', '0010_alter_invoice_budget'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoice',
            name='budget',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='BudgetInvoiceAPI.budget'),
        ),
    ]
