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
    
]