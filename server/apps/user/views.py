from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.authtoken.models import Token
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from PIL import Image
from io import BytesIO
import uuid
import os
from django.conf import settings
from .models import Product
import base64
from django.core.files.base import ContentFile
from apps.user.models import User
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from django.http import JsonResponse
from apps.user.serializers import (
	UserSerializer, LoginSerializer, SignupSerializer
)

class UserView(ListAPIView):
	queryset = User.objects.all().order_by('first_name')
	serializer_class = UserSerializer
	pagination_class = LimitOffsetPagination

	def get_queryset(self):
		excludeUsersArr = []
		try:
			excludeUsers = self.request.query_params.get('exclude')
			if excludeUsers:
				userIds = excludeUsers.split(',')
				for userId in userIds:
					excludeUsersArr.append(int(userId))
		except:
			return []
		return super().get_queryset().exclude(id__in=excludeUsersArr)

class LoginApiView(TokenObtainPairView):
	permission_classes = [AllowAny]
	serializer_class = LoginSerializer

class SignupApiView(CreateAPIView):
	permission_classes = [AllowAny]
	queryset = User.objects.all()
	serializer_class = SignupSerializer

def get_user_data(request):
    access_token = request.GET.get('access_token')
    if not access_token:
        return JsonResponse({'error': 'Access token missing'}, status=400)
    
    # Make a request to the remote API to fetch user data
    response = requests.get('https://api.example.com/user', headers={'Authorization': f'Bearer {access_token}'})
    if response.status_code != 200:
        return JsonResponse({'error': 'Failed to fetch user data'}, status=500)
    
    user_data = response.json()
    # Save the user data in session storage
    request.session['user_data'] = user_data
    
    return JsonResponse(user_data)


    
@csrf_exempt
def my_view(request):
    if request.method == 'POST':
       
        json_data = json.loads(request.body)
        token = json_data.get('token', None)  # assuming 'token' is the key for the access token in the JSON data
        print(token)
        if token:
            try:
                # Get user object for the token
                token_obj = Token.objects.get(key=token)
                user = token_obj.user
              
                # Get user id and name
                print(user)

                # Return user details in JSON response
                return JsonResponse({
                    'user': user
                })
            except Token.DoesNotExist:
                # Token not found
                return JsonResponse({
                    'error': 'Invalid token',
                })
        else:
            # Token not provided
            return JsonResponse({
                'error': 'Token not provided',
            })
        return JsonResponse({'message': 'Data retrieved successfully'})
    else:
        return JsonResponse({'message': 'Invalid request method'})
    

@csrf_exempt
def get_user_details(request):
    if request.method == "POST":
        user = None
        json_data = json.loads(request.body)
        user_id = json_data.get('user_id', None)
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({'User': None})
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'image':"http://127.0.0.1:8000/"+user.image.url if user.image else None,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
            return JsonResponse({'User': user_data})
        else:
            return JsonResponse({'Error':'Insufficient Data'}) 
    else:
        return JsonResponse({'Error':'Invalid Method'})

@csrf_exempt
def create_product2(request):
     print('Hello')
     return JsonResponse({'hello':'world'})


@csrf_exempt
def create_product(request):
    if request.method == "POST":
        # Parse JSON data from request body
        print(1)
        data = json.loads(request.body)
        name = data.get('name')
        price = data.get('price')
        image_data = data.get('image')
        user_id=data.get('user_id')
        image_url=None
        print(2)
        #if not all([name, price, image_data]):
        #    return JsonResponse({'error': 'Missing data'})
        print(3)
        try:
            # Decode base64 image data and generate a unique filename
            #image_data = base64.b64decode(image_data)
            print('OI')
            image_binary_data = base64.b64decode(image_data.split(',')[1])
        
            img = Image.open(BytesIO(image_binary_data))
            filename = f'{uuid.uuid4()}.jpg'
            path="C:\Sam Sund ar\Rayven\django-chat\server\media"
            #img_path=os.path.join(path,'product_images',filename)
            img_path = os.path.join(settings.MEDIA_ROOT, 'product_images', filename)
            print(img_path)
            img.save(img_path)
            
            print(4)
            # Save the image locally
            
            image_url = f"{settings.MEDIA_URL}product_images/{filename}"
        except:
            print('error')
        user=User.objects.get(id=user_id)
        
        print(5)
        # Create the new product object
        product = Product.objects.create(
            name=name,
            price=price,
            owner=user,
            image=image_url
        )
        print(1)
        # Return the URL of the saved image in the response
        image_url = request.build_absolute_uri(product.image.url)
        print(1)
        return JsonResponse({'product': {
            'name': product.name,
            'price': product.price,
            'image_url': image_url
        }})
    else:
        return JsonResponse({'error': 'Invalid method'})

@csrf_exempt
def getProducts(request):
    if request.method=='POST':
       body_bytes=request.body 
       request_data=json.loads(body_bytes)
       user_id=request_data.get('user_id')
       try :
           
           user = get_object_or_404(User, pk=user_id)
           print(user)
           product = Product.objects.filter(owner=user)
           print(product)
           data = {'products': []}
           for product in product:
               data['products'].append({
               'id': product.id,
               'name': product.name,
               'price': str(product.price),
               'image_url': request.build_absolute_uri(product.image.url),
            })
           return JsonResponse({'products':data})
       except:
            return JsonResponse({'error':'occurred'})
    else:
         return JsonResponse({'error':'Invalid Operation'})   

@csrf_exempt
def changePrice(request):
    print(1)
    if request.method == 'POST':
        try:
           body_bytes=request.body 
           print(2)
           print(body_bytes)
           request_data=json.loads(body_bytes)
           print(request_data)
           product_id=int(request_data['id'])
           product_price=int(request_data['price'])
           product=Product.objects.filter(id=product_id).first()

           print(product) 
           if product:
              product.price=product_price
              product.save()
              return JsonResponse({'success':True})
           else :
              return JsonResponse({'error':'Product Not Found'})
        except:
           print("error")
           return JsonResponse({'error':'Product Not Found'}) 
    return JsonResponse({'error':'Invalid Request'})