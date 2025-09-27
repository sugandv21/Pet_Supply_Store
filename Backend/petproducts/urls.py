from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PetCategoryViewSet,
    PetProductViewSet,
    PetBannerViewSet,
    PetPageViewSet,
)
from .product_detail_views import PetProductDetailAPIView
from .views_cart import CartViewSet
from .views import ProductReviewViewSet



router = DefaultRouter()
router.register(r"pet-categories", PetCategoryViewSet, basename="pet-category")
router.register(r"pet-products", PetProductViewSet, basename="pet-product")
router.register(r"pet-banners", PetBannerViewSet, basename="pet-banner")
router.register(r"pet-page", PetPageViewSet, basename="pet-page")
router.register(r'cart', CartViewSet, basename='cart')
router.register(r"product-reviews", ProductReviewViewSet, basename="productreview")

urlpatterns = [
    path("", include(router.urls)),
    path("pet-product/<int:id>/", PetProductDetailAPIView.as_view(), name="pet-product-detail"),
    
    path("pet-product/<int:product_pk>/reviews/",
         ProductReviewViewSet.as_view({"get": "list", "post": "create"}),
         name="product-reviews-nested"),
]