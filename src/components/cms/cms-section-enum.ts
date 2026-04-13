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
        id: "promotional-banners",
        label: "Promotional Banners",
        children: [
            { id: "promotional-banner-1", label: "Banner 1", children: [] },
            { id: "promotional-banner-2", label: "Banner 2", children: [] },
            { id: "promotional-banner-3", label: "Banner 3", children: [] },
            { id: "promotional-banner-4", label: "Banner 4", children: [] },
            { id: "promotional-banner-5", label: "Banner 5", children: [] },
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

]