from django.db import models
from django.contrib.auth.models import AbstractUser
from shortuuidfield import ShortUUIDField

class User(AbstractUser):
	userId = ShortUUIDField()
	image = models.ImageField(upload_to="user")
	is_shop_owner = models.BooleanField(default=False)
    
class OnlineUser(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)

	def __str__(self):
		return self.user.username

class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
