import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AccountSupportView from '../views/AccountSupportView.vue'
import InventoryView from '../views/InventoryView.vue'
import OrderListView from '../views/OrderListView.vue'
import OrderCreateView from '../views/OrderCreateView.vue'
import ReturnListView from '../views/ReturnListView.vue'
import ReturnCreateView from '../views/ReturnCreateView.vue'
import ProductListView from '../views/ProductListView.vue'
import InventoryView from '../views/franchise/InventoryView.vue'
import OrderListView from '../views/franchise/OrderListView.vue'
import OrderCreateView from '../views/franchise/OrderCreateView.vue'
import ReturnListView from '../views/franchise/ReturnListView.vue'
import ReturnCreateView from '../views/franchise/ReturnCreateView.vue'
import ProductListView from '../views/franchise/ProductListView.vue'
import OrderDetailView from '../views/franchise/OrderDetailView.vue' // Import for head-office detail temporarily
import HeadOfficeOrderListView from '../views/head-office/OrderListView.vue' // New import

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/franchise/inventory'
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
            path: '/franchise/inventory',
            name: 'franchise-inventory',
            component: InventoryView
        },
        {
            path: '/franchise/orders',
            name: 'franchise-order-list',
            component: OrderListView
        },
        {
            path: '/franchise/orders/create',
            name: 'franchise-order-create',
            component: OrderCreateView
        },
        {
            path: '/franchise/returns',
            name: 'franchise-return-list',
            component: ReturnListView
        },
        {
            path: '/franchise/returns/create',
            name: 'franchise-return-create',
            component: ReturnCreateView
        },
        {
            path: '/franchise/returns/:id',
            name: 'franchise-return-detail',
            component: () => import('../views/franchise/ReturnDetailView.vue')
        },
        {
            path: '/franchise/orders/:id',
            name: 'franchise-order-detail',
            component: () => import('../views/franchise/OrderDetailView.vue')
        },
        {
            path: '/franchise/products/sell',
            name: 'franchise-product-sell',
            component: () => import('../views/franchise/ProductSalesView.vue')
        },
        {
            path: '/franchise/products',
            name: 'franchise-product-list',
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
        // New head office routes
        {
            path: '/head-office/orders',
            name: 'head-office-order-list',
            component: HeadOfficeOrderListView
        },
        {
            path: '/head-office/orders/:id',
            name: 'head-office-order-detail',
            component: OrderDetailView // Using franchise OrderDetailView temporarily
        },
        {
            path: '/head-office/orders/:id/edit',
            name: 'head-office-order-edit',
            component: () => import('../views/head-office/OrderEditView.vue')
        }
    ]
})

export default router
