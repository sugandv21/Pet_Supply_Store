# petshop/serializers_detail.py
from rest_framework import serializers
from .models import PetProduct, ProductReview
from .serializers import ImageURLField, PetProductSerializer
# petproducts/serializers.py
from rest_framework import serializers
from .models import ProductReview, PetProduct

class ProductReviewSerializer(serializers.ModelSerializer):
    # product optional when using nested route /pet-product/<pk>/reviews/
    product = serializers.PrimaryKeyRelatedField(
        queryset=PetProduct.objects.all(),
        required=False,
    )

    class Meta:
        model = ProductReview
        fields = ["id", "product", "name", "email", "rating", "review", "created", "is_public"]
        read_only_fields = ["id", "created", "is_public"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value

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
