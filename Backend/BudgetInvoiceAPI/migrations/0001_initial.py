# Generated by Django 5.0.3 on 2024-03-21 21:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nif', models.CharField(db_index=True, max_length=10)),
                ('name', models.CharField(db_index=True, max_length=255)),
                ('address', models.CharField(db_index=True, max_length=255)),
                ('email', models.CharField(db_index=True, max_length=255)),
                ('phone', models.SmallIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Budget',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(db_index=True, max_length=255)),
                ('data', models.JSONField()),
                ('price', models.DecimalField(db_index=True, decimal_places=2, max_digits=10)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='BudgetInvoiceAPI.client')),
            ],
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(db_index=True, max_length=255)),
                ('data', models.JSONField()),
                ('budget', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='BudgetInvoiceAPI.budget')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='BudgetInvoiceAPI.client')),
            ],
        ),
    ]
