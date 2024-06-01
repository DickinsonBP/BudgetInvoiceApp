# Generated by Django 5.0.6 on 2024-06-01 14:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('BudgetInvoiceAPI', '0018_alter_budget_client_alter_invoice_budget_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budget',
            name='client',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='BudgetInvoiceAPI.client'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='budget',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='BudgetInvoiceAPI.budget'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='client',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='BudgetInvoiceAPI.client'),
        ),
    ]