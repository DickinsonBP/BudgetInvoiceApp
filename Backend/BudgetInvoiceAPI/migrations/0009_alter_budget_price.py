# Generated by Django 5.0.6 on 2024-05-18 15:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('BudgetInvoiceAPI', '0008_invoice_price'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budget',
            name='price',
            field=models.DecimalField(db_index=True, decimal_places=2, default=0.0, max_digits=10),
        ),
    ]
