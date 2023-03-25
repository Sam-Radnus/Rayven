from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination
from apps.chat.serializers import ChatRoomSerializer, ChatMessageSerializer
from apps.chat.models import ChatRoom, ChatMessage
from textblob import TextBlob
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from nltk.sentiment import SentimentIntensityAnalyzer

class ChatRoomView(APIView):
    def get(self, request, userId):
        chatRooms = ChatRoom.objects.filter(member=userId)
        serializer = ChatRoomSerializer(
            chatRooms, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ChatRoomSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessagesView(ListAPIView):
    serializer_class = ChatMessageSerializer
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        roomId = self.kwargs['roomId']
        return ChatMessage.objects.\
            filter(chat__roomId=roomId).order_by('-timestamp')


def sentiment_analysis(msg):
    message = msg
    if message:
        blob = TextBlob(message)
        sentiment_score = blob.sentiment.polarity
        sentiment = 'positive' if sentiment_score > 0 else 'negative' if sentiment_score < 0 else 'neutral'
        response = {
            'sentiment_score': sentiment_score,
            'sentiment': sentiment
        }
        return response
    else:
        print('error')

@csrf_exempt
def get_sentiment(request):
    print(request)
    if request.method == 'POST':
        print(request.POST)
        print(request.GET)
        body_bytes = request.body
    
    # Decode the bytes into a string using UTF-8 encoding
        body_str = body_bytes.decode('utf-8')
    
    # Parse the string as JSON
        body_json = json.loads(body_str)
    
    # Extract data from the JSON object
        message = body_json.get('message')
        print('analyzing')
        if message:
            print(2)
            sia = SentimentIntensityAnalyzer()
            scores = sia.polarity_scores(message)
            print(scores)
            return JsonResponse({'sentiment_scores': scores})
    else:
        print('make a POST request')
    return JsonResponse({'error': 'Invalid request'})