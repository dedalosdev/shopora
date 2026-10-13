from django.http import JsonResponse

def home(request):
    data = {
        'message': 'Welcome to the Shopora Store'
    }
    return JsonResponse(data)
    
