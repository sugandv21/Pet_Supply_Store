from django.contrib import admin
from django.utils.html import format_html
from .models import PetCategory, PetProduct, PetBanner, ProductReview


class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    readonly_fields = ("created", "ip_address")
    fields = ("name", "email", "rating", "is_public", "created")
    show_change_link = True


@admin.register(PetCategory)
class PetCategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "pet_type", "group", "order", "thumb")
    list_filter = ("pet_type", "group")
    search_fields = ("title", "subtitle")
    ordering = ("pet_type", "group", "order", "id")

    def thumb(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:4px;object-fit:cover;"/>',
                obj.image.url,
            )
        return "-"


@admin.register(PetProduct)
class PetProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "pet_type",
        "brand",
        "price",
        "quantity_display",
        "rating",
        "rating_count",
        "is_active",
        "thumb",
    )
    list_filter = ("pet_type", "is_active", "rating", "quantity_unit", "brand", "size", "life_stage")
    search_fields = ("title", "brand")
    filter_horizontal = ("related",)
    ordering = ("pet_type", "order", "-created")
    inlines = [ProductReviewInline]

    def thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px;object-fit:contain;"/>', obj.image.url)
        return "-"


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "name", "email", "rating", "created", "is_public")
    list_filter = ("rating", "created", "is_public")
    search_fields = ("name", "email", "review", "product__title")
    readonly_fields = ("created", "ip_address")
    ordering = ("-created",)

    actions = ["make_public", "make_private"]

    def make_public(self, request, queryset):
        updated = queryset.update(is_public=True)
        self.message_user(request, f"{updated} review(s) marked as public.")
    make_public.short_description = "Mark selected reviews as public"

    def make_private(self, request, queryset):
        updated = queryset.update(is_public=False)
        self.message_user(request, f"{updated} review(s) marked as private.")
    make_private.short_description = "Mark selected reviews as private"


@admin.register(PetBanner)
class PetBannerAdmin(admin.ModelAdmin):
    list_display = ("pet_type", "title")
    list_filter = ("pet_type",)
    search_fields = ("title",)
