from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination
from apps.chat.serializers import ChatRoomSerializer, ChatMessageSerializer
from apps.chat.models import ChatRoom, ChatMessage
from django.views.decorators.csrf import csrf_protect
from textblob import TextBlob
from .models import User
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from nltk.sentiment import SentimentIntensityAnalyzer
import openai
import spacy

# Load the language model
nlp = spacy.load('en_core_web_sm')


class ChatRoomView(APIView):
    def get(self, request, userId):
        chatRooms = ChatRoom.objects.filter(member=userId)
        
        serializer = ChatRoomSerializer(
            chatRooms, many=True, context={"request": request}
        )
        print(1)
        print(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ChatRoomSerializer(
            data=request.data, context={"request": request}
        )
        print(2)
        print(serializer)
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


@csrf_exempt
def openai_response(request):
   
    print(1)
    if request.method == 'POST':
        print(2)
        body_str=json.loads(request.body)
    
        message = body_str['message']
        print(message)
        blob=TextBlob(message)
        intent = ""
        shop_owner = ""
        product = ""
        print(3)
        print(blob)
        print(4)
        print(blob.tags)
        for word, tag in blob.tags:
            if tag == "NN" and not intent:
                intent = word.lower()
            if tag=="NNS":
                intent = word.lower()
            elif tag == "NN" and not shop_owner:
                shop_owner = word
            elif tag == "NN" and not product:
                product = word
        response = ""
        print("intent:",intent)
        if intent == "shop":
            response = "The shop is open from 9am to 6pm every day."

        elif intent == "product_list" or intent == "products":
            if shop_owner:
                # Look up products for shop_owner in database
                products = ["product1", "product2", "product3"]
                response = f"The available products for {shop_owner} are {', '.join(products)}"
            else:
                response = "Please provide the name of the shop owner."

        elif intent == "product_details":
            if product:
                # Look up product details in database
                details = "Product details go here."
                response = f"Details for {product}: {details}"
            else:
                response = "Please provide the name of the product."

        else:
            response = "I'm sorry, I don't understand. Can you please rephrase your query?"
        print(response)
        return JsonResponse({'response': response})
 
@csrf_exempt
def openai_response2(request):
    # Load OpenAI API key
    print(1)
    
    openai.api_key = ""
   
    # Get input message from request body in JSON format
    request_data = json.loads(request.body)
    input_message = request_data['message']
    print(input_message)
    if input_message==None: return JsonResponse({'ERROR':'No Input'})

    # Define OpenAI parameters and make request
    prompt = f"Q: {input_message}\nA:"
    model_engine = "davinci"
    response = openai.Completion.create(
        engine=model_engine,
        prompt=prompt,
        max_tokens=50,
        n=1,
        stop=None,
        temperature=0.7,
    )

    # Extract OpenAI response and return as JSON
    output_message = response.choices[0].text.strip()
   
    response_data = {'message': output_message}
    return JsonResponse(response_data) 

@csrf_exempt
def get_status(request):
    print(1)
    if request.method == 'POST':
        try:
           body_bytes=request.body 
           print(2)
           print(body_bytes)
           request_data=json.loads(body_bytes)
           print(request_data)
           user_id=int(request_data['id'])
           user=User.objects.filter(id=user_id).first()
           print(user) 
           if user:
              print(4)
              shop_owner=user.is_shop_owner
              print(5)
              response_Data={'isShopOwner': shop_owner if shop_owner is not None else False} 
              return JsonResponse(response_Data)
           else :
              return JsonResponse({'error':'User Not Found'})
        except:
           print("error")
           return JsonResponse({'error':'User Not Found'}) 
    return JsonResponse({'error':'Invalid Request'})