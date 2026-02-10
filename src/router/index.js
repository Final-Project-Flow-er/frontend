import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AccountSupportView from '../views/AccountSupportView.vue'
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
            path: '/login',
            name: 'Login',
            component: LoginView
        },
        {
            path: '/account',
            name: 'AccountSupport',
            component: AccountSupportView
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
        }
    ]
})

export default router
