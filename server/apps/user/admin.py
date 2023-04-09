from django.contrib import admin
from apps.user.models import User, OnlineUser,Product

admin.site.register(User)
admin.site.register(OnlineUser)
admin.site.register(Product)