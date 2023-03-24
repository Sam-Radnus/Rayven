import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from apps.chat.models import ChatRoom, ChatMessage
from apps.user.models import User, OnlineUser
from .views import sentiment_analysis
from PIL import Image
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import requests
from django.conf import settings
import os
from asgiref.sync import sync_to_async
import base64
from io import BytesIO
from django.db import transaction
from text2emotion import get_emotion
import asyncio
class ChatConsumer(AsyncWebsocketConsumer):
    def getUser(self, userId):
        return User.objects.get(id=userId)

    def getOnlineUsers(self):
        onlineUsers = OnlineUser.objects.all()
        return [onlineUser.user.id for onlineUser in onlineUsers]

    def addOnlineUser(self, user):
        try:
            OnlineUser.objects.create(user=user)
        except:
            pass

    def deleteOnlineUser(self, user):
        try:
            OnlineUser.objects.get(user=user).delete()
        except:
            pass

    @database_sync_to_async  
    def save_chat_message_async(chat_message):
        chat_message.save()

    def saveMessage(self, message, userId, roomId):
        userObj = User.objects.get(id=userId)
        chatObj = ChatRoom.objects.get(roomId=roomId)
        image_data=None
        img_name=None
        img_path=None
        chatMessageObj = None 
        imgdata=None
        # Check if the message is an image message
        if 'image' in message:
            image_data = message['image']
            try: 
                print("0")
                image_binary_data = base64.b64decode(image_data.split(',')[1])
                print("1")
                
                # Load the binary data as an image using BytesIO
                img = Image.open(BytesIO(image_binary_data))
                print("2")
                
                chatMessageObj = ChatMessage.objects.create(
                    chat=chatObj,
                    user=userObj,
                )
                
                # Use the chat message ID as the image name
                img_name = f"{chatMessageObj.id}.jpg"  
                print("4")
                img_path = os.path.join(settings.MEDIA_ROOT, 'chat_images', img_name)
                print("img_path",img_path)
                img.save(img_path)
                print("5")
            except Exception as e:
                print('Error:',e)
    
            # Set the image URL to the path relative to the media folder
            image_url = f"{settings.MEDIA_URL}chat_images/{img_name}"
            #image_url = f"{settings.MEDIA_ROOT}chat_images/{img_name}"
            print("6")
            print(image_url)
            # Update the ChatMessage object with the image data
            print('img_data_0',image_url)
            chatMessageObj.image_data = image_url
            print("image_url",chatMessageObj.image_data.url)
            self.save_chat_message_async(chatMessageObj)
            chatMessageObj = ChatMessage.objects.create(
                chat=chatObj, user=userObj, image_data=chatMessageObj.image_data.url
            )  
            print(chatMessageObj)
            sync_to_async(chatMessageObj.save)()
            print("7")
        else:
            # Create a new ChatMessage object with the text message
            print('No Image')
            chatMessageObj = ChatMessage.objects.create(
                chat=chatObj, user=userObj, message=message['message']
            )      
            #await self.save_chat_message_async(chatMessageObj)
        data={
            'action': 'message',
            'user': userId,
            'roomId': roomId,
            'message': chatMessageObj.message,
            'image_data': 'http://127.0.0.1:8000/'+chatMessageObj.image_data.url if chatMessageObj.image_data.url!=None else None,
            'userImage': userObj.image.url,
            'userName': userObj.first_name + " " + userObj.last_name,
            'timestamp': str(chatMessageObj.timestamp),
        }
        print(data)
        # Return the chat message data
        return data
 #   nltk.downloader.Downloader().uninstall()
#nltk.download('vader_lexicon')

    async def sendOnlineUserList(self):
        onlineUserList = await database_sync_to_async(self.getOnlineUsers)()
        chatMessage = {
            'type': 'chat_message',
            'message': {
                    'action': 'onlineUser',
                'userList': onlineUserList
            }
        }
        await self.channel_layer.group_send('onlineUser', chatMessage)

    async def connect(self):
        self.userId = self.scope['url_route']['kwargs']['userId']
        self.userRooms = await database_sync_to_async(
            list
        )(ChatRoom.objects.filter(member=self.userId))
        for room in self.userRooms:
            await self.channel_layer.group_add(
                room.roomId,
                self.channel_name
            )
        await self.channel_layer.group_add('onlineUser', self.channel_name)
        self.user = await database_sync_to_async(self.getUser)(self.userId)
        await database_sync_to_async(self.addOnlineUser)(self.user)
        await self.sendOnlineUserList()
        await self.accept()

    async def disconnect(self, close_code):
        await database_sync_to_async(self.deleteOnlineUser)(self.user)
        await self.sendOnlineUserList()
        for room in self.userRooms:
            await self.channel_layer.group_discard(
                room.roomId,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']
        roomId = text_data_json['roomId']

        chatMessage = {}
        if action == 'message':
            if 'message' in text_data_json:
                message = text_data_json
                
                userId = text_data_json['user']
                chatMessage = await database_sync_to_async(
                    self.saveMessage
                )(message, userId, roomId)
            else:
            # For image messages
                image = text_data_json['image']
                message=text_data_json
                userId = text_data_json['user']
                chatMessage = await database_sync_to_async(
                    self.saveMessage
            )(message, userId, roomId)
        elif action == 'typing':
            chatMessage = text_data_json
        await self.channel_layer.group_send(
            roomId,
            {
                'type': 'chat_message',
                'message': chatMessage
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
    