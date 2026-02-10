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
import ProductSalesView from '../views/franchise/ProductSalesView.vue'
import FranchiseOrderDetailView from '../views/franchise/OrderDetailView.vue'
import HeadOfficeOrderListView from '../views/head-office/OrderListView.vue'
import HeadOfficeOrderCreateView from '../views/head-office/OrderCreateView.vue'
import HeadOfficeOrderReceptionView from '../views/head-office/OrderReceptionView.vue'
import HeadOfficeOrderRequestView from '../views/head-office/OrderRequestView.vue'
import HeadOfficeOrderDetailView from '../views/head-office/OrderDetailView.vue'
import HeadOfficeReturnRequestListView from '../views/head-office/ReturnRequestListView.vue'
import FactoryOrderListView from '../views/factory/OrderListView.vue'
import FactoryOrderRequestView from '../views/factory/OrderRequestView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/franchise/inventory'
        },
        // --- Franchise Routes ---
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
            path: '/franchise/orders/:id',
            name: 'franchise-order-detail',
            component: FranchiseOrderDetailView
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
            path: '/franchise/returns/:id/edit',
            name: 'franchise-return-edit',
            component: () => import('../views/franchise/ReturnEditView.vue')
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
        {
            // New head office routes
            path: '/franchise/products/sell',
            name: 'franchise-product-sell',
            component: ProductListView
        },
        {
            path: '/franchise/products/sales-form',
            name: 'franchise-product-sales-form',
            component: ProductSalesView
        },

        // --- Head Office Routes ---
        {
            path: '/head-office/orders',
            name: 'head-office-order-list',
            component: HeadOfficeOrderListView
        },
        {
            path: '/head-office/orders/create',
            name: 'head-office-order-create',
            component: HeadOfficeOrderCreateView
        },
        {
            path: '/head-office/orders/reception',
            name: 'head-office-order-reception',
            component: HeadOfficeOrderReceptionView
        },
        {
            path: '/head-office/orders/request',
            name: 'head-office-order-request',
            component: HeadOfficeOrderRequestView
        },
        {
            path: '/head-office/orders/:id',
            name: 'head-office-order-detail',
            component: HeadOfficeOrderDetailView
        },
        {
            path: '/head-office/orders/:id/edit',
            name: 'head-office-order-edit',
            component: () => import('../views/head-office/OrderEditView.vue')
        },
        {
            path: '/head-office/returns',
            name: 'head-office-return-list',
            component: HeadOfficeReturnRequestListView
        },
        {
            path: '/head-office/returns/:id',
            name: 'head-office-return-detail',
            component: () => import('../views/head-office/ReturnRequestDetailView.vue')
        },

        // --- Factory Routes ---
        {
            path: '/factory/orders',
            name: 'factory-order-list',
            component: FactoryOrderListView
        },
        {
            path: '/factory/orders/request',
            name: 'factory-order-request',
            component: FactoryOrderRequestView
        }
    ]
})

export default router
