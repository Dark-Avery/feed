# Generated by Django 4.2.1 on 2024-12-21 21:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('feeder', '0048_merge_20241119_1536'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedtransaction',
            name='group_badge',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='feed_transactions', to='feeder.groupbadge', verbose_name='Групповой бейдж'),
        ),
    ]
