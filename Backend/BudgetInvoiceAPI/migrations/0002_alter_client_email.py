# Generated by Django 5.0.3 on 2024-03-25 19:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('BudgetInvoiceAPI', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client',
            name='email',
            field=models.EmailField(db_index=True, max_length=255),
        ),
    ]
