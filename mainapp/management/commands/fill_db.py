from authapp.models import ShopUser
from django.core.management.base import BaseCommand
import json, os

from mainapp.models import ProductCategory, Product

JSON_PATH = 'mainapp/jsons'


def load_from_json(file_name):
    with open(os.path.join(JSON_PATH, file_name + '.json'), mode='r', encoding='UTF-8') as infile:
        return json.load(infile)


class Command(BaseCommand):
    def handle(self, *args, **options):
        categories = load_from_json('categories')

        ProductCategory.objects.all().delete()
        for category in categories:
            new_category = ProductCategory(**category)
            new_category.save()

        products = load_from_json('products')

        Product.objects.all().delete()
        for product in products:
            category_id = product['category']
            _category = ProductCategory.objects.get(pk=category_id)

            product['category'] = _category
            new_product = Product(**product)
            new_product.save()

        ShopUser.objects.create_superuser('admin', "admin@geekshop.ru", '123', age=30)
