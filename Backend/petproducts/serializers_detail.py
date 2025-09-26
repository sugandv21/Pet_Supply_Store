# petshop/serializers_detail.py
from rest_framework import serializers
from .models import PetProduct, ProductReview
from .serializers import ImageURLField, PetProductSerializer


class ProductReviewSerializer(serializers.ModelSerializer):
    created = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ProductReview
        fields = ["id", "name", "email", "rating", "review", "created"]


class PetProductDetailSerializer(serializers.ModelSerializer):
    image = ImageURLField(required=False, allow_null=True)
    quantity_display = serializers.ReadOnlyField()
    related_products = PetProductSerializer(source="related", many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)

    # expose filterable metadata on detail
    brand = serializers.CharField(read_only=True)
    size = serializers.CharField(read_only=True)
    breed = serializers.CharField(read_only=True)
    life_stage = serializers.CharField(read_only=True)
    flavor = serializers.CharField(read_only=True)

    class Meta:
        model = PetProduct
        fields = [
            "id", "pet_type", "title", "brand", "size", "breed", "life_stage", "flavor",
            "image", "description",
            "price", "mrp", "quantity_value", "quantity_unit", "quantity_display",
            "rating", "rating_count", "related_products", "reviews",
        ]
