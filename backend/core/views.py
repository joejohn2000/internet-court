from django.http import HttpResponse, JsonResponse


LOADER_IO_TOKENS = {
    'loaderio-c1662272c97d116ce75d84609b5d965c': 'loaderio-c1662272c97d116ce75d84609b5d965c',
    'loaderio-c606583dc7b0df48d25cfa7ef125d863': 'loaderio-c606583dc7b0df48d25cfa7ef125d863',
}


def healthz(_request):
    return JsonResponse({'status': 'ok'})


def loaderio_verification(_request, token):
    if token not in LOADER_IO_TOKENS:
        return HttpResponse(status=404)
    return HttpResponse(LOADER_IO_TOKENS[token], content_type='text/plain')
