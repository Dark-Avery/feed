# Generated by Django 4.2.1 on 2024-10-03 19:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feeder', '0042_remove_department_lead_delete_location_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='volunteercustomfield',
            name='mobile',
            field=models.BooleanField(default=False, verbose_name='Показывать в мобильной админке?'),
        ),
    ]
