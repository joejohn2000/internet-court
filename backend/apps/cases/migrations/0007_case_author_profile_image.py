from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cases', '0006_shorten_case_verdict_timer_for_testing'),
    ]

    operations = [
        migrations.AddField(
            model_name='case',
            name='author_profile_image',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
    ]
