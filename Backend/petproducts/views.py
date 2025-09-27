# petshop/viewsets.py
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.core.paginator import Paginator
from rest_framework.response import Response
from django.db.models import Q

from .models import PetCategory, PetProduct, PetBanner
from .serializers import (
    PetCategorySerializer,
    PetProductSerializer,
    PetBannerSerializer,
)
from rest_framework import mixins, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.shortcuts import get_object_or_404
from .models import ProductReview, PetProduct
from .serializers_detail import ProductReviewSerializer

# Optional: simple throttle to limit review submissions
class ReviewAnonThrottle(AnonRateThrottle):
    rate = "10/hour"  # adjust as needed

class ProductReviewViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = ProductReviewSerializer
    permission_classes = [AllowAny]
    queryset = ProductReview.objects.select_related("product").all()

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get("product")
        if product_id:
            qs = qs.filter(product_id=product_id, is_public=True)
        else:
            qs = qs.filter(is_public=True)
        return qs

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        product_pk = kwargs.get("product_pk")
        if product_pk:
            # ensure product exists
            get_object_or_404(PetProduct, pk=product_pk)
            data["product"] = product_pk

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Keep new reviews private by default (admin can approve)
        instance = serializer.save(ip_address=request.META.get("REMOTE_ADDR"), is_public=False)

        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)

PAGE_SIZE = 9

# helper to apply filters from request.query_params (supports repeated params)
def apply_product_filters(qs, params):
    # fields we support filtering by
    filter_fields = ["brand", "size", "breed", "life_stage", "flavor"]
    q = qs
    for f in filter_fields:
        values = params.getlist(f)
        if values:
            # filter for any of the provided values (case-sensitive by default)
            q = q.filter(**{f"{f}__in": values})
    return q


def apply_sorting(qs, sort_key):
    """
    sort_key values: best, relevance, price_asc, price_desc, new, top
    mapping:
      - best -> -rating_count (best sellers by review count)
      - relevance -> use default ordering
      - price_asc -> price
      - price_desc -> -price
      - new -> -created
      - top -> -rating
    """
    if not sort_key or sort_key == "relevance":
        return qs
    mapping = {
        "best": "-rating_count",
        "price_asc": "price",
        "price_desc": "-price",
        "new": "-created",
        "top": "-rating",
    }
    order_by = mapping.get(sort_key)
    if order_by:
        return qs.order_by(order_by)
    return qs


class PetCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = PetCategorySerializer
    queryset = PetCategory.objects.all()

    def get_queryset(self):
        pet_type = self.request.query_params.get("pet_type", "dog")
        return PetCategory.objects.filter(pet_type=pet_type).order_by("order", "id")


class PetProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = PetProductSerializer
    queryset = PetProduct.objects.all()

    def get_queryset(self):
        pet_type = self.request.query_params.get("pet_type", "dog")
        base_qs = PetProduct.objects.filter(pet_type=pet_type, is_active=True)
        # apply filters
        qs = apply_product_filters(base_qs, self.request.query_params)
        # apply sort
        sort_key = self.request.query_params.get("sort")
        res = apply_sorting(qs, sort_key)
# if res has no explicit ordering, Django will use model ordering; to be safe:
        return res.order_by(* (res.query.order_by or ["order", "-created", "id"]))


class PetBannerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = PetBannerSerializer
    queryset = PetBanner.objects.all()

    def get_queryset(self):
        pet_type = self.request.query_params.get("pet_type", "dog")
        return PetBanner.objects.filter(pet_type=pet_type)


class PetPageViewSet(viewsets.ViewSet):
    """
    Combined page payload via DefaultRouter:
    - GET /api/pet-page/         -> defaults to pet_type=dog&page=1
    - GET /api/pet-page/?pet_type=cat&page=2
    Accepts filter query params (brand, size, breed, life_stage, flavor) as repeated params.
    Accepts `sort` param (best, relevance, price_asc, price_desc, new, top).
    """
    permission_classes = [AllowAny]

    def list(self, request):
        pet_type = request.query_params.get("pet_type", "dog")
        page_num = int(request.query_params.get("page", 1))
        sort_key = request.query_params.get("sort")

        categories = PetCategory.objects.filter(pet_type=pet_type).order_by("order", "id")
        products_qs = PetProduct.objects.filter(pet_type=pet_type, is_active=True)

        # apply filtering from query params
        products_qs = apply_product_filters(products_qs, request.query_params)
        # apply sorting
        products_qs = apply_sorting(products_qs, sort_key)

        banner = PetBanner.objects.filter(pet_type=pet_type).first()

        paginator = Paginator(products_qs, PAGE_SIZE)
        page = paginator.get_page(page_num)

        # Build available filter values from the base product set for this pet_type (unfiltered)
        # If you prefer available filters to be based on current filtered set, use products_qs instead.
        base_for_filters = PetProduct.objects.filter(pet_type=pet_type, is_active=True)

        def distinct_list(qs, field):
            vals = list(qs.order_by(field).values_list(field, flat=True).distinct())
            # filter out empty/None and convert to strings
            return [v for v in vals if v is not None and str(v).strip() != ""]

        available_filters = {
            "brand": distinct_list(base_for_filters, "brand"),
            "size": distinct_list(base_for_filters, "size"),
            "breed": distinct_list(base_for_filters, "breed"),
            "life_stage": distinct_list(base_for_filters, "life_stage"),
            "flavor": distinct_list(base_for_filters, "flavor"),
        }

        data = {
            "title": pet_type.capitalize(),
            "promos": PetCategorySerializer(categories, many=True, context={"request": request}).data,
            "sidebar": [{
                "id": 0,
                "title": "Categories",
                "items": PetCategorySerializer(categories, many=True, context={"request": request}).data
            }],
            "products": PetProductSerializer(page.object_list, many=True, context={"request": request}).data,
            "banner": PetBannerSerializer(banner, context={"request": request}).data if banner else None,
            "pagination": {
                "page": page.number,
                "total_pages": paginator.num_pages,
                "total_items": paginator.count,
            },
            "available_filters": available_filters,
            "applied_filters": {
                f: request.query_params.getlist(f) for f in ["brand", "size", "breed", "life_stage", "flavor"]
            },
            "applied_sort": sort_key,
        }
        return Response(data)
