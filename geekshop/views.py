from django.shortcuts import render


def index(request):
    return render(request, 'geekshop/index.html')


def contacts(request):
    return render(request, 'geekshop/contacts.html')