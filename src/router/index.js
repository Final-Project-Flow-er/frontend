import { createRouter, createWebHistory } from 'vue-router'
import InventoryView from '../views/InventoryView.vue'
import OrderListView from '../views/OrderListView.vue'
import OrderCreateView from '../views/OrderCreateView.vue'
import ReturnListView from '../views/ReturnListView.vue'
import ReturnCreateView from '../views/ReturnCreateView.vue'
import ProductListView from '../views/ProductListView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/inventory'
        },
        {
            path: '/inventory',
            name: 'inventory',
            component: InventoryView
        },
        {
            path: '/orders',
            name: 'order-list',
            component: OrderListView
        },
        {
            path: '/orders/create',
            name: 'order-create',
            component: OrderCreateView
        },
        {
            path: '/returns',
            name: 'return-list',
            component: ReturnListView
        },
        {
            path: '/returns/create',
            name: 'return-create',
            component: ReturnCreateView
        },
        {
            path: '/returns/:id',
            name: 'return-detail',
            component: () => import('../views/ReturnDetailView.vue')
        },
        {
            path: '/orders/:id',
            name: 'order-detail',
            component: () => import('../views/OrderDetailView.vue')
        },
        {
            path: '/products/sell',
            name: 'product-sell',
            component: () => import('../views/ProductSalesView.vue')
        },
        {
            path: '/products',
            name: 'product-list',
            component: ProductListView
        },
        {
            path: '/store/inventory',
            name: 'store-inventory',
            component: () => import('../views/StoreInventoryManagementView.vue')
        },
        {
            path: '/store/inventory/:productCode',
            name: 'store-inventory-detail',
            component: () => import('../views/StoreInventoryDetailView.vue')
        },
        {
            path: '/products/manage',
            name: 'product-manage',
            component: () => import('../views/StoreProductManagementView.vue')
        },
        {
            path: '/inventory/logs',
            name: 'inventory-logs',
            component: () => import('../views/StoreInventoryLogView.vue')
        },
        {
            path: '/hq/products/manage',
            name: 'hq-product-manage',
            component: () => import('../views/HQProductManagementView.vue')
        },
        {
            path: '/hq/inventory/factory',
            name: 'hq-inventory-factory',
            component: () => import('../views/HQFactoryInventoryView.vue')
        },
        {
            path: '/hq/inventory/franchise',
            name: 'hq-inventory-franchise',
            component: () => import('../views/HQFranchiseInventoryView.vue')
        },
        {
            path: '/hq/inventory/logs/hq',
            name: 'hq-log-hq',
            component: () => import('../views/HQInventoryLogView.vue')
        },
        {
            path: '/hq/inventory/logs/franchise',
            name: 'hq-log-franchise',
            component: () => import('../views/HQFranchiseInventoryLogView.vue')
        },
        {
            path: '/hq/inventory/logs/factory',
            name: 'hq-log-factory',
            component: () => import('../views/HQFactoryInventoryLogView.vue')
        }
    ]
})

export default router
