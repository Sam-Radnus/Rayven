from django.urls import path
from apps.chat.views import ChatRoomView, MessagesView,get_sentiment,openai_response,get_status

urlpatterns = [
	path('chats', ChatRoomView.as_view(), name='chatRoom'),
	path('chats/<str:roomId>/messages', MessagesView.as_view(), name='messageList'),
	path('users/<int:userId>/chats', ChatRoomView.as_view(), name='chatRoomList'),
    path('sentiment/',get_sentiment,name="get_sentiment"),
    path('response/',openai_response,name="get_responses"),
    path('isShopOwner/',get_status,name="get status"),
   
]
