"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  BadgePercent,
  Check,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Loader2,
  MessageCircle,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  emoji: string | null;
};

type ProductAddon = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  active: boolean;
  position: number;
};

type Product = {
  id: string;
  store_id: string;
  category_id: string | null;
  slug: string | null;
  emoji: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_promotion: boolean;
  promotion_price: number | null;
  active: boolean;
  position: number;
  addons: ProductAddon[];
};

type FormAddon = {
  local_id: string;
  id?: string;
  name: string;
  price: string;
  active: boolean;
};

type ProductForm = {
  emoji: string;
  name: string;
  description: string;
  price: string;
  category_id: string;
  is_promotion: boolean;
  promotion_price: string;
  active: boolean;
};

const PRODUCT_BUCKET = "product-images";

const EMPTY_FORM: ProductForm = {
  emoji: "🍔",
  name: "",
  description: "",
  price: "",
  category_id: "",
  is_promotion: false,
  promotion_price: "",
  active: true,
};

function newLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ProdutosPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("Minha Loja");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [formAddons, setFormAddons] = useState<FormAddon[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function showMessage(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2800);
  }

  function normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function money(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function parsePrice(value: string) {
    if (!value.trim()) return 0;

    const cleanValue = value
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".");

    const number = Number(cleanValue);
    return Number.isFinite(number) ? number : 0;
  }

  function formatPriceInput(value: number | null | undefined) {
    if (value === null || value === undefined) return "";
    return Number(value).toFixed(2).replace(".", ",");
  }

  function getCategoryName(categoryId: string | null) {
    return (
      categories.find((category) => category.id === categoryId)?.name ||
      "Sem categoria"
    );
  }

  async function loadData() {
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id, name")
        .eq("owner_id", user.id)
        .single();

      if (storeError || !store) {
        showMessage("Não foi possível localizar sua loja.");
        return;
      }

      setStoreId(store.id);
      setStoreName(store.name || "Minha Loja");

      const [
        { data: categoriesData, error: categoriesError },
        { data: productsData, error: productsError },
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, emoji")
          .eq("store_id", store.id)
          .order("position", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("store_id", store.id)
          .order("position", { ascending: true }),
      ]);

      if (categoriesError) throw categoriesError;
      if (productsError) throw productsError;

      const loadedCategories = (categoriesData || []) as Category[];
      const loadedProducts = (productsData || []) as Omit<Product, "addons">[];

      setCategories(loadedCategories);

      const productIds = loadedProducts.map((product) => product.id);
      let loadedAddons: ProductAddon[] = [];

      if (productIds.length > 0) {
        const { data: addonsData, error: addonsError } = await supabase
          .from("product_addons")
          .select("id, product_id, name, price, active, position")
          .in("product_id", productIds)
          .order("position", { ascending: true });

        if (addonsError) throw addonsError;
        loadedAddons = (addonsData || []) as ProductAddon[];
      }

      const hydratedProducts: Product[] = loadedProducts.map((product) => ({
        ...product,
        addons: loadedAddons.filter(
          (addon) => addon.product_id === product.id
        ),
      }));

      setProducts(hydratedProducts);
      setForm((current) => ({
        ...current,
        category_id: current.category_id || loadedCategories[0]?.id || "",
      }));
    } catch (error) {
      console.error(error);
      showMessage("Erro ao carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      const category = getCategoryName(product.category_id).toLowerCase();

      return (
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        category.includes(term)
      );
    });
  }, [products, search, categories]);

  const previewProducts = useMemo(
    () => products.filter((product) => product.active).slice(0, 8),
    [products]
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.active).length,
      promotions: products.filter((product) => product.is_promotion).length,
    }),
    [products]
  );

  function clearImageState() {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    clearImageState();
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      category_id: categories[0]?.id || "",
    });
    setFormAddons([]);
  }

  function editProduct(product: Product) {
    clearImageState();
    setEditing(product);
    setForm({
      emoji: product.emoji || "🍽️",
      name: product.name,
      description: product.description || "",
      price: formatPriceInput(product.price),
      category_id: product.category_id || "",
      is_promotion: product.is_promotion,
      promotion_price: formatPriceInput(product.promotion_price),
      active: product.active,
    });
    setFormAddons(
      product.addons.map((addon) => ({
        local_id: newLocalId(),
        id: addon.id,
        name: addon.name,
        price: formatPriceInput(addon.price),
        active: addon.active,
      }))
    );
    setImagePreview(product.image_url);
    setRemoveCurrentImage(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      showMessage("Use uma imagem JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("A imagem pode ter no máximo 5 MB.");
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveCurrentImage(false);
  }

  function requestRemoveImage() {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function addAddonField() {
    setFormAddons((current) => [
      ...current,
      {
        local_id: newLocalId(),
        name: "",
        price: "",
        active: true,
      },
    ]);
  }

  function updateAddonField(
    localId: string,
    field: "name" | "price" | "active",
    value: string | boolean
  ) {
    setFormAddons((current) =>
      current.map((addon) =>
        addon.local_id === localId ? { ...addon, [field]: value } : addon
      )
    );
  }

  function removeAddonField(localId: string) {
    setFormAddons((current) =>
      current.filter((addon) => addon.local_id !== localId)
    );
  }

  function getStoragePathFromPublicUrl(url: string | null) {
    if (!url) return null;

    const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(url.slice(markerIndex + marker.length));
  }

  async function uploadProductImage(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
    const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "webp";
    const filePath = `${storeId}/${crypto.randomUUID()}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(PRODUCT_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function removeImageFromStorage(url: string | null) {
    const path = getStoragePathFromPublicUrl(url);
    if (!path) return;

    const { error } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .remove([path]);

    if (error) {
      console.warn("Não foi possível remover a imagem antiga:", error.message);
    }
  }

  async function saveAddons(productId: string) {
    const validAddons = formAddons
      .map((addon, index) => ({
        ...addon,
        name: addon.name.trim(),
        parsedPrice: parsePrice(addon.price),
        position: index,
      }))
      .filter((addon) => addon.name.length > 0);

    const existingAddonIds = editing?.addons.map((addon) => addon.id) || [];
    const keptAddonIds = validAddons
      .map((addon) => addon.id)
      .filter(Boolean) as string[];
    const removedAddonIds = existingAddonIds.filter(
      (id) => !keptAddonIds.includes(id)
    );

    if (removedAddonIds.length > 0) {
      const { error } = await supabase
        .from("product_addons")
        .delete()
        .in("id", removedAddonIds);

      if (error) throw error;
    }

    for (const addon of validAddons) {
      if (addon.id) {
        const { error } = await supabase
          .from("product_addons")
          .update({
            name: addon.name,
            price: addon.parsedPrice,
            active: addon.active,
            position: addon.position,
          })
          .eq("id", addon.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("product_addons").insert({
          product_id: productId,
          name: addon.name,
          price: addon.parsedPrice,
          active: addon.active,
          position: addon.position,
        });

        if (error) throw error;
      }
    }
  }

  async function saveProduct() {
    if (!storeId) return;

    const name = form.name.trim();
    const price = parsePrice(form.price);
    const promotionPrice = parsePrice(form.promotion_price);

    if (!name) {
      showMessage("Digite o nome do produto.");
      return;
    }

    if (price <= 0) {
      showMessage("Digite um preço válido.");
      return;
    }

    if (
      form.is_promotion &&
      (promotionPrice <= 0 || promotionPrice >= price)
    ) {
      showMessage("O preço promocional precisa ser menor que o preço normal.");
      return;
    }

    setSaving(true);

    let uploadedImageUrl: string | null = null;

    try {
      if (imageFile) {
        uploadedImageUrl = await uploadProductImage(imageFile);
      }

      const imageUrl = imageFile
        ? uploadedImageUrl
        : removeCurrentImage
        ? null
        : editing?.image_url || null;

      const productPayload = {
        store_id: storeId,
        category_id: form.category_id || null,
        slug: normalizeSlug(name),
        emoji: form.emoji.trim() || "🍽️",
        name,
        description: form.description.trim(),
        price,
        image_url: imageUrl,
        is_promotion: form.is_promotion,
        promotion_price: form.is_promotion ? promotionPrice : null,
        active: form.active,
      };

      let savedProductId = editing?.id || "";

      if (editing) {
        const { error } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", editing.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({
            ...productPayload,
            position: products.length,
          })
          .select("id")
          .single();

        if (error) throw error;
        savedProductId = data.id;
      }

      await saveAddons(savedProductId);

      if (
        editing?.image_url &&
        (imageFile || removeCurrentImage) &&
        editing.image_url !== imageUrl
      ) {
        await removeImageFromStorage(editing.image_url);
      }

      showMessage(editing ? "Produto atualizado." : "Produto criado.");
      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);

      if (uploadedImageUrl) {
        await removeImageFromStorage(uploadedImageUrl);
      }

      showMessage("Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Apagar "${product.name}"? Essa ação não poderá ser desfeita.`
    );

    if (!confirmed) return;

    setActionId(product.id);

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      await removeImageFromStorage(product.image_url);

      const nextProducts = products
        .filter((item) => item.id !== product.id)
        .map((item, index) => ({ ...item, position: index }));

      setProducts(nextProducts);
      await persistPositions(nextProducts);
      showMessage("Produto apagado.");
    } catch (error) {
      console.error(error);
      showMessage("Não foi possível apagar o produto.");
    } finally {
      setActionId(null);
    }
  }

  async function duplicateProduct(product: Product) {
    setActionId(product.id);

    try {
      const copiedName = `${product.name} cópia`;
      const copiedSlug = `${normalizeSlug(copiedName)}-${Date.now()
        .toString()
        .slice(-5)}`;

      const { data: copiedProduct, error: productError } = await supabase
        .from("products")
        .insert({
          store_id: storeId,
          category_id: product.category_id,
          slug: copiedSlug,
          emoji: product.emoji,
          name: copiedName,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          is_promotion: product.is_promotion,
          promotion_price: product.promotion_price,
          active: product.active,
          position: products.length,
        })
        .select("*")
        .single();

      if (productError) throw productError;

      if (product.addons.length > 0) {
        const { error: addonsError } = await supabase
          .from("product_addons")
          .insert(
            product.addons.map((addon, index) => ({
              product_id: copiedProduct.id,
              name: addon.name,
              price: addon.price,
              active: addon.active,
              position: index,
            }))
          );

        if (addonsError) throw addonsError;
      }

      await loadData();
      showMessage("Produto duplicado.");
    } catch (error) {
      console.error(error);
      showMessage("Não foi possível duplicar o produto.");
    } finally {
      setActionId(null);
    }
  }

  async function toggleActive(product: Product) {
    const nextActive = !product.active;
    setActionId(product.id);

    try {
      const { error } = await supabase
        .from("products")
        .update({ active: nextActive })
        .eq("id", product.id);

      if (error) throw error;

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, active: nextActive } : item
        )
      );
    } catch (error) {
      console.error(error);
      showMessage("Não foi possível alterar a visibilidade.");
    } finally {
      setActionId(null);
    }
  }

  async function togglePromotion(product: Product) {
    const nextPromotion = !product.is_promotion;
    setActionId(product.id);

    try {
      const fallbackPromotionPrice =
        product.promotion_price ||
        Number((Number(product.price) * 0.9).toFixed(2));

      const { error } = await supabase
        .from("products")
        .update({
          is_promotion: nextPromotion,
          promotion_price: nextPromotion ? fallbackPromotionPrice : null,
        })
        .eq("id", product.id);

      if (error) throw error;

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                is_promotion: nextPromotion,
                promotion_price: nextPromotion
                  ? fallbackPromotionPrice
                  : null,
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      showMessage("Não foi possível alterar a promoção.");
    } finally {
      setActionId(null);
    }
  }

  async function persistPositions(nextProducts: Product[]) {
    const results = await Promise.all(
      nextProducts.map((product, index) =>
        supabase
          .from("products")
          .update({ position: index })
          .eq("id", product.id)
      )
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;
  }

  function handleDragStart(
    event: DragEvent<HTMLDivElement>,
    productId: string
  ) {
    if (search.trim()) {
      event.preventDefault();
      showMessage("Limpe a busca para ordenar os produtos.");
      return;
    }

    setDraggedProductId(productId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", productId);
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
    productId: string
  ) {
    event.preventDefault();
    if (!draggedProductId || draggedProductId === productId) return;
    setDragOverProductId(productId);
  }

  async function handleDrop(
    event: DragEvent<HTMLDivElement>,
    targetProductId: string
  ) {
    event.preventDefault();

    const sourceProductId =
      draggedProductId || event.dataTransfer.getData("text/plain");

    setDraggedProductId(null);
    setDragOverProductId(null);

    if (
      !sourceProductId ||
      sourceProductId === targetProductId ||
      search.trim()
    ) {
      return;
    }

    const previousProducts = [...products];
    const sourceIndex = previousProducts.findIndex(
      (product) => product.id === sourceProductId
    );
    const targetIndex = previousProducts.findIndex(
      (product) => product.id === targetProductId
    );

    if (sourceIndex === -1 || targetIndex === -1) return;

    const nextProducts = [...previousProducts];
    const [movedProduct] = nextProducts.splice(sourceIndex, 1);
    nextProducts.splice(targetIndex, 0, movedProduct);

    const positionedProducts = nextProducts.map((product, index) => ({
      ...product,
      position: index,
    }));

    setProducts(positionedProducts);

    try {
      await persistPositions(positionedProducts);
      showMessage("Ordem atualizada.");
    } catch (error) {
      console.error(error);
      setProducts(previousProducts);
      showMessage("Não foi possível salvar a nova ordem.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
          <p className="text-sm font-bold text-zinc-500">
            Carregando seus produtos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-220px] top-[-180px] h-[520px] w-[520px] rounded-full bg-orange-500/15 blur-[150px]" />
        <div className="absolute bottom-[-260px] right-[-220px] h-[560px] w-[560px] rounded-full bg-orange-500/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:70px_70px] opacity-20" />
      </div>

      {message && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full border border-orange-400/30 bg-[#15100c]/95 px-5 py-3 text-sm font-black text-orange-300 shadow-2xl backdrop-blur-xl">
          {message}
        </div>
      )}

      <section className="relative z-10 mx-auto grid min-h-screen max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
        <div className="space-y-5">
          <header className="flex flex-col gap-5 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl md:flex-row md:items-end md:justify-between">
            <div>
              <button
                onClick={() => router.push("/painel")}
                className="mb-5 inline-flex items-center gap-2 text-sm font-black text-zinc-400 transition hover:text-orange-400"
              >
                <ArrowLeft size={16} />
                Voltar ao painel
              </button>

              <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-orange-400">
                Gestão da vitrine
              </p>

              <h1 className="text-3xl font-black tracking-[-0.04em] md:text-5xl">
                Produtos
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Cadastre produtos, envie fotos, crie promoções, configure
                adicionais e arraste os cards para mudar a ordem da loja.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <StatCard value={stats.total} label="produtos" />
              <StatCard value={stats.active} label="ativos" />
              <StatCard value={stats.promotions} label="promoções" />
            </div>
          </header>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
                <Search size={18} className="ml-2 text-orange-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por produto ou categoria..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {search.trim() && (
                <p className="px-2 text-xs font-bold text-zinc-600">
                  Para arrastar e reorganizar, limpe a busca.
                </p>
              )}

              {filteredProducts.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500/10 text-3xl">
                    🍔
                  </div>
                  <h2 className="mt-4 text-xl font-black">
                    Nenhum produto encontrado
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    Cadastre um produto novo ou tente outra busca.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product, index) => {
                    const isBusy = actionId === product.id;
                    const effectivePrice =
                      product.is_promotion && product.promotion_price
                        ? product.promotion_price
                        : product.price;

                    return (
                      <div
                        key={product.id}
                        draggable={!search.trim()}
                        onDragStart={(event) =>
                          handleDragStart(event, product.id)
                        }
                        onDragOver={(event) =>
                          handleDragOver(event, product.id)
                        }
                        onDrop={(event) => handleDrop(event, product.id)}
                        onDragEnd={() => {
                          setDraggedProductId(null);
                          setDragOverProductId(null);
                        }}
                        className={`group rounded-[26px] border bg-white/[0.04] p-4 backdrop-blur-xl transition ${
                          dragOverProductId === product.id
                            ? "border-orange-400 bg-orange-500/10"
                            : "border-white/10 hover:border-orange-400/30"
                        } ${
                          draggedProductId === product.id
                            ? "scale-[0.99] opacity-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            title="Arraste para mudar a posição"
                            className={`mt-5 rounded-xl p-1 ${
                              search.trim()
                                ? "cursor-not-allowed text-zinc-800"
                                : "cursor-grab text-zinc-600 active:cursor-grabbing"
                            }`}
                          >
                            <GripVertical size={19} />
                          </button>

                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-3xl">
                                {product.emoji || "🍽️"}
                              </div>
                            )}

                            <span className="absolute bottom-1 left-1 rounded-full bg-black/75 px-2 py-1 text-[9px] font-black text-white">
                              #{index + 1}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-base font-black">
                                {product.name}
                              </p>

                              {product.is_promotion && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-1 text-[10px] font-black text-orange-300">
                                  <BadgePercent size={11} />
                                  promoção
                                </span>
                              )}

                              {!product.active && (
                                <span className="rounded-full bg-zinc-500/15 px-2 py-1 text-[10px] font-black text-zinc-400">
                                  oculto
                                </span>
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                              {product.description || "Sem descrição."}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {product.is_promotion &&
                                product.promotion_price && (
                                  <span className="text-xs font-bold text-zinc-600 line-through">
                                    {money(product.price)}
                                  </span>
                                )}

                              <span className="text-sm font-black text-orange-400">
                                {money(effectivePrice)}
                              </span>

                              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-zinc-500">
                                {getCategoryName(product.category_id)}
                              </span>

                              {product.addons.length > 0 && (
                                <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-2 py-1 text-[10px] font-bold text-orange-300">
                                  {product.addons.length} adicional
                                  {product.addons.length > 1 ? "is" : ""}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-5 gap-2 border-t border-white/5 pt-4">
                          <ActionButton
                            title="Editar produto"
                            onClick={() => editProduct(product)}
                          >
                            <Edit3 size={15} />
                          </ActionButton>

                          <ActionButton
                            title="Duplicar produto"
                            onClick={() => duplicateProduct(product)}
                            disabled={isBusy}
                          >
                            {isBusy ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Copy size={15} />
                            )}
                          </ActionButton>

                          <ActionButton
                            title={
                              product.is_promotion
                                ? "Remover promoção"
                                : "Ativar promoção"
                            }
                            onClick={() => togglePromotion(product)}
                            disabled={isBusy}
                            active={product.is_promotion}
                          >
                            <Star size={15} />
                          </ActionButton>

                          <ActionButton
                            title={
                              product.active
                                ? "Ocultar produto"
                                : "Ativar produto"
                            }
                            onClick={() => toggleActive(product)}
                            disabled={isBusy}
                          >
                            {product.active ? (
                              <Eye size={15} />
                            ) : (
                              <EyeOff size={15} />
                            )}
                          </ActionButton>

                          <button
                            type="button"
                            title="Apagar produto"
                            onClick={() => deleteProduct(product)}
                            disabled={isBusy}
                            className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sticky top-5 rounded-[30px] border border-orange-400/20 bg-[#120d09]/95 p-5 shadow-[0_0_70px_rgba(249,115,22,0.08)] backdrop-blur-xl">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                    {editing ? "Editando" : "Cadastro"}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    {editing ? editing.name : "Novo produto"}
                  </h2>
                </div>

                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-white/10 bg-black/30 p-2 text-zinc-400 transition hover:text-white"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-black text-zinc-300">
                    Foto do produto
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="overflow-hidden rounded-[24px] border border-dashed border-orange-400/30 bg-black/35">
                    {imagePreview ? (
                      <div className="relative aspect-[16/10]">
                        <img
                          src={imagePreview}
                          alt="Preview do produto"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-12">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-black backdrop-blur-md transition hover:bg-white/20"
                          >
                            <ImagePlus size={14} />
                            Trocar
                          </button>
                          <button
                            type="button"
                            onClick={requestRemoveImage}
                            className="flex items-center justify-center rounded-xl bg-red-500/20 px-3 py-2 text-xs font-black text-red-300 backdrop-blur-md transition hover:bg-red-500/30"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 p-5 text-center"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                          <UploadCloud size={24} />
                        </span>
                        <span>
                          <strong className="block text-sm">
                            Enviar foto do produto
                          </strong>
                          <span className="mt-1 block text-[11px] text-zinc-500">
                            JPG, PNG ou WEBP de até 5 MB
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[76px_1fr] gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-black text-zinc-300">
                      Emoji
                    </label>
                    <input
                      value={form.emoji}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          emoji: event.target.value,
                        }))
                      }
                      maxLength={4}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-center text-2xl outline-none transition focus:border-orange-400/50"
                    />
                  </div>

                  <Field
                    label="Nome do produto"
                    value={form.name}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, name: value }))
                    }
                    placeholder="Ex.: Smash duplo"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-zinc-300">
                    Descrição
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Descreva o produto do jeito que aparecerá na loja."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-orange-400/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Preço normal"
                    value={form.price}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, price: value }))
                    }
                    placeholder="29,90"
                    inputMode="decimal"
                  />

                  <div>
                    <label className="mb-2 block text-xs font-black text-zinc-300">
                      Categoria
                    </label>
                    <select
                      value={form.category_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          category_id: event.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none transition focus:border-orange-400/50"
                    >
                      <option value="">Sem categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.emoji || "📦"} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <ToggleRow
                    icon={<BadgePercent size={17} />}
                    title="Produto em promoção"
                    description="Mostra o preço antigo riscado e destaca a oferta."
                    checked={form.is_promotion}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        is_promotion: checked,
                      }))
                    }
                  />

                  {form.is_promotion && (
                    <div className="mt-4">
                      <Field
                        label="Preço promocional"
                        value={form.promotion_price}
                        onChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            promotion_price: value,
                          }))
                        }
                        placeholder="24,90"
                        inputMode="decimal"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
                  <ToggleRow
                    icon={form.active ? <Eye size={17} /> : <EyeOff size={17} />}
                    title="Produto ativo"
                    description="Quando desligado, ele some da loja pública."
                    checked={form.active}
                    onChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        active: checked,
                      }))
                    }
                  />
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black">Adicionais</p>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        Ex.: bacon, queijo extra, molho especial.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addAddonField}
                      className="inline-flex items-center gap-1 rounded-xl bg-orange-500/15 px-3 py-2 text-xs font-black text-orange-300 transition hover:bg-orange-500/25"
                    >
                      <Plus size={14} />
                      Adicionar
                    </button>
                  </div>

                  {formAddons.length === 0 ? (
                    <button
                      type="button"
                      onClick={addAddonField}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 py-4 text-xs font-bold text-zinc-600 transition hover:border-orange-400/30 hover:text-orange-400"
                    >
                      <Plus size={14} />
                      Criar primeiro adicional
                    </button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {formAddons.map((addon, index) => (
                        <div
                          key={addon.local_id}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                              Adicional {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                removeAddonField(addon.local_id)
                              }
                              className="text-zinc-600 transition hover:text-red-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-[1fr_105px] gap-2">
                            <input
                              value={addon.name}
                              onChange={(event) =>
                                updateAddonField(
                                  addon.local_id,
                                  "name",
                                  event.target.value
                                )
                              }
                              placeholder="Nome"
                              className="min-w-0 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs outline-none placeholder:text-zinc-700 focus:border-orange-400/50"
                            />
                            <input
                              value={addon.price}
                              onChange={(event) =>
                                updateAddonField(
                                  addon.local_id,
                                  "price",
                                  event.target.value
                                )
                              }
                              inputMode="decimal"
                              placeholder="+ 3,00"
                              className="min-w-0 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs outline-none placeholder:text-zinc-700 focus:border-orange-400/50"
                            />
                          </div>

                          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] font-bold text-zinc-500">
                            <input
                              type="checkbox"
                              checked={addon.active}
                              onChange={(event) =>
                                updateAddonField(
                                  addon.local_id,
                                  "active",
                                  event.target.checked
                                )
                              }
                              className="accent-orange-500"
                            />
                            Adicional disponível
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={saveProduct}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 font-black shadow-[0_0_35px_rgba(249,115,22,0.25)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : editing ? (
                    <Check size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                  {saving
                    ? "Salvando..."
                    : editing
                    ? "Salvar alterações"
                    : "Adicionar produto"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl lg:block">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-lg font-black">Preview da loja</p>
              <p className="text-xs text-zinc-500">
                Exatamente na ordem dos produtos.
              </p>
            </div>
            <Package className="text-orange-400" size={20} />
          </div>

          <div className="sticky top-5 mx-auto max-w-[320px] rounded-[42px] border border-white/15 bg-black p-3 shadow-2xl">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#080808]">
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-5">
                <span className="inline-flex rounded-full bg-black/25 px-3 py-1 text-[10px] font-black backdrop-blur">
                  Loja aberta
                </span>
                <h3 className="mt-3 text-2xl font-black leading-none">
                  {storeName}
                </h3>
                <p className="mt-2 text-xs text-orange-100">
                  Escolha seus produtos favoritos
                </p>
              </div>

              <div className="border-b border-white/5 p-3">
                <div className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2.5 text-[11px] text-zinc-600">
                  <Search size={13} />
                  Buscar no cardápio
                </div>
              </div>

              <div className="max-h-[590px] space-y-3 overflow-y-auto p-3">
                {previewProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
                    <p className="text-2xl">🍽️</p>
                    <p className="mt-2 text-xs font-black">
                      Nenhum produto ativo
                    </p>
                  </div>
                ) : (
                  previewProducts.map((product) => {
                    const currentPrice =
                      product.is_promotion && product.promotion_price
                        ? product.promotion_price
                        : product.price;

                    return (
                      <div
                        key={product.id}
                        className="overflow-hidden rounded-[20px] border border-white/8 bg-white/[0.045]"
                      >
                        <div className="flex gap-3 p-3">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-orange-500/10">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-3xl">
                                {product.emoji || "🍽️"}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            {product.is_promotion && (
                              <span className="mb-1 inline-flex rounded-full bg-orange-500/15 px-2 py-1 text-[8px] font-black uppercase text-orange-300">
                                promoção
                              </span>
                            )}

                            <p className="line-clamp-1 text-xs font-black">
                              {product.name}
                            </p>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-zinc-500">
                              {product.description || "Produto da loja"}
                            </p>

                            <div className="mt-2 flex items-center gap-1.5">
                              {product.is_promotion &&
                                product.promotion_price && (
                                  <span className="text-[9px] font-bold text-zinc-700 line-through">
                                    {money(product.price)}
                                  </span>
                                )}
                              <span className="text-xs font-black text-orange-400">
                                {money(currentPrice)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {product.addons.some((addon) => addon.active) && (
                          <div className="border-t border-white/5 px-3 py-2 text-[9px] font-bold text-zinc-600">
                            Adicionais disponíveis
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-white/5 p-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-xs font-black"
                >
                  <MessageCircle size={15} />
                  Ver pedido
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[86px] rounded-2xl border border-white/5 bg-black/35 px-4 py-3">
      <p className="text-xl font-black text-orange-400">{value}</p>
      <p className="text-[10px] font-bold text-zinc-500">{label}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric";
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black text-zinc-300">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-orange-400/50"
      />
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black">{title}</span>
        <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span className="relative h-7 w-12 rounded-full bg-zinc-800 transition peer-checked:bg-orange-500">
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-xl border py-2.5 transition disabled:opacity-50 ${
        active
          ? "border-orange-400/40 bg-orange-500/15 text-orange-400"
          : "border-white/10 bg-black/30 text-zinc-300 hover:border-orange-400/40 hover:text-orange-400"
      }`}
    >
      {children}
    </button>
  );
}