import { CMSSection } from "./types";

export const cmsSections: CMSSection[] = [
    {
        id: "navbar",
        label:"Navbar",
        children:[],
    },
    {
        id: 'homepage',
        label: 'Homepage',
        children: [
            { id: 'hero-desktop-banner', label: 'Hero Desktop Banner', children: [] },
            { id: 'hero-mobile-banner', label: 'Hero Mobile Banner', children: [] },
            { id: 'product-range', label: 'Product Range', children: [] },
            { id: "shop-from-bestsellers", label:"Shop From Our Bestsellers", children:[]},
            { id: "shop-by-shape", label:"Shop by Shape", children:[]},
            { id: "collections", label:"Collections", children:[]},
            { id: "gift-guide", label:"Gift Guide", children:[]},
            { id: "engagement", label:"Engagement", children:[]},
            { id: "muse", label:"Muse", children:[]},
            { id: "assurance", label:"Assurance", children:[]},
            { id: 'instagram', label: 'Instagram', children: [] },
            { id: "experience", label:"Experience", children:[]},
        ],
    },
    {
        id: "product-list-page",
        label: "Product List Page",
        children: [
            { id: "product-list-page-hero-banner", label: "Hero Banner", children: [] },
            { id: "product-list-page-mid-size-banners", label: "Mid Size Banners", children: [] },
            { id: "product-list-page-large-size-banners", label: "Large Size Banners", children: [] },
        ],
    },
    {
        id: "wishlist",
        label: "Wishlist",
        children: [
            { id: "wishlist-hero-banner", label: "Hero Banner", children: [] },
        ],
    },
    {
        id: "categories-page",
        label: "Categories Page",
        children: [
            { id: "product-list-details", label: "Product List Details", children: [] },
        ],
    },
    {
        id: "product-description-page",
        label: "Product Description Page",
        children: [
            { id: "jewellery-care", label: "Jewellery Care", children: [] },
            { id: "whats-in-the-box", label: "What's in the Box", children: [] },
            { id: "more-from-the-collection", label: "More From The Collection", children: [] },
        ],
    },
    {
        id: "policy-pages",
        label:"Policy Pages",
        children:[
            { id: "privacy-policy", label: "Privacy Policy", children:[]},
            { id: "lifetime-exchange-buyback-policy", label: "Lifetime Exchange & Buy Back Policy", children:[]},
            { id: "return-refund-exchange-policy", label:"Return, Refund & Exchange Policy", children:[]},
            { id: "terms-conditions", label: "Terms & Conditions", children:[]},
            { id: "shipping-policy", label: "Shipping Policy", children:[]},
        ]
    },
    {
        id: "partner-with-us",
        label: "Partner With Us",
        children:[]
    },
    {
        id: "about-us",
        label: "About Us",
        children:[]
    },
    {
        id: "jewellery-care-guide",
        label: "Jewellery Care Guide",
        children:[]
    },
    {
        id: "general",
        label: "General",
        children:[]
    },
    {
        id: "blog",
        label: "Blog",
        children:[]
    },
    {
        id: 'guide',
        label: 'Guide',
        children: [
            { id: 'diamond-education', label: 'Diamond Education', children: [] },
            { id: 'metal-guide', label: 'Metal Guide', children: [] },
        ],
    },

]