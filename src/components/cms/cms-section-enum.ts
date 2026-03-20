import { CMSSection } from "./types";

export const cmsSections: CMSSection[] = [
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
    }
]