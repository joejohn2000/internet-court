from django.http import HttpResponse, JsonResponse


LOADER_IO_TOKEN = 'loaderio-c1662272c97d116ce75d84609b5d965c'


def healthz(_request):
    return JsonResponse({'status': 'ok'})


def loaderio_verification(_request):
    return HttpResponse(LOADER_IO_TOKEN, content_type='text/plain')
