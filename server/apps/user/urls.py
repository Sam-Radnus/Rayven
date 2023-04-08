from django.urls import path
from apps.user.views import UserView, LoginApiView, SignupApiView , my_view,get_user_details

urlpatterns = [
	path('users', UserView.as_view(), name='userList'),
	path('login', LoginApiView.as_view(), name='login'),
	path('signup', SignupApiView.as_view(), name='signup'),
    path('getUserProfile',get_user_details,name="myview")
]
