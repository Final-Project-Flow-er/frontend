import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AccountSupportView from '../views/AccountSupportView.vue'
import InventoryView from '../views/franchise/InventoryView.vue'
import InboundView from '../views/franchise/InboundView.vue'
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
import FactoryInboundView from '../views/factory/InboundView.vue'
import FactoryOutboundView from '../views/factory/OutboundView.vue'
import HeadOfficeVehicleAssignmentView from '../views/head-office/VehicleAssignmentView.vue'
import HeadOfficeReturnVehicleAssignmentView from '../views/head-office/ReturnVehicleAssignmentView.vue'
import MyPageView from '../views/MyPageView.vue'
import StoreFactoryRegistrationView from '../views/OrganizationRegistrationView.vue'
import FranchiseListView from '../views/FranchiseListView.vue'
import FactoryListView from '../views/FactoryListView.vue'
import HeadOfficeManagementView from '../views/HeadOfficeManagementView.vue'
import OrganizationDetailView from '../views/OrganizationDetailView.vue'
import MemberListView from '../views/MemberListView.vue'
import MemberDetailView from '../views/MemberDetailView.vue'
import NoticeListView from '../views/NoticeListView.vue'
import NoticeRegistrationView from '../views/NoticeRegistrationView.vue'
import NoticeDetailView from '../views/NoticeDetailView.vue'
import LogisticsRegistrationView from '../views/LogisticsRegistrationView.vue'
import LogisticsListView from '../views/LogisticsListView.vue'
import OrderReceptionDetailView from "@/views/head-office/OrderReceptionDetailView.vue";
import ReturnRequestReceptionList from "@/views/head-office/ReturnRequestReceptionList.vue";
import HeadOfficeLogisticsLogView from "@/views/head-office/LogisticsLogView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: () => {
                const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
                if (!isLoggedIn) return '/login'

                const userRole = sessionStorage.getItem('userRole')
                if (userRole === 'admin' || userRole === 'headOffice') return '/registration'
                if (userRole === 'factory') return '/factory/inbound'
                if (userRole === 'franchise') return '/store/inventory'

                return '/login'
            }
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
            path: '/franchise/inventory',
            name: 'franchise-inventory',
            component: InventoryView
        },
        {
            path: '/franchise/inbound',
            name: 'franchise-inbound',
            component: InboundView
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
            path: '/mypage',
            name: 'mypage',
            component: MyPageView
        },
        {
            path: '/registration',
            name: 'store-factory-registration',
            component: StoreFactoryRegistrationView
        },
        {
            path: '/organizations',
            redirect: '/registration'
        },
        {
            path: '/admin/organizations/franchise',
            name: 'franchise-list',
            component: FranchiseListView
        },
        {
            path: '/admin/organizations/factory',
            name: 'factory-list',
            component: FactoryListView
        },
        {
            path: '/admin/head-office/management',
            name: 'head-office-management',
            component: HeadOfficeManagementView
        },
        {
            path: '/organization/:code',
            name: 'organization-detail',
            component: OrganizationDetailView
        },
        {
            path: '/admin/member-registration',
            name: 'MemberRegistration',
            component: () => import('../views/MemberRegistrationView.vue')
        },
        {
            path: '/admin/member-logs',
            name: 'MemberLogs',
            component: () => import('../views/MemberLogView.vue')
        },
        {
            path: '/admin/members',
            name: 'member-list',
            component: MemberListView
        },
        {
            path: '/admin/members/:employeeNumber',
            name: 'member-detail',
            component: MemberDetailView
        },
        {
            path: '/notice',
            name: 'notice-list',
            component: NoticeListView
        },
        {
            path: '/notice/register',
            name: 'notice-register',
            component: NoticeRegistrationView
        },
        {
            path: '/notice/edit/:id',
            name: 'notice-edit',
            component: NoticeRegistrationView
        },
        {
            path: '/notice/:id',
            name: 'notice-detail',
            component: NoticeDetailView
        },
        {
            path: '/admin/logistics-registration',
            name: 'logistics-registration',
            component: LogisticsRegistrationView
        },
        {
            path: '/admin/logistics',
            name: 'logistics-list',
            component: LogisticsListView
        },
        {
            path: '/notifications',
            name: 'notification-list',
            component: () => import('../views/NotificationListView.vue')
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
        {
            path: '/franchise/products/sales/:salesCode',
            name: 'franchise-sales-detail',
            component: () => import('../views/franchise/SalesDetailView.vue')
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
            path: '/head-office/orders/reception/detail',
            name: 'OrderReceptionDetail',
            component: OrderReceptionDetailView,
        },
        {
            path: '/head-office/returns/reception',
            name: 'ReturnRequestReception',
            component: ReturnRequestReceptionList,
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
        {
            path: '/head-office/logs/logistics',
            name: 'head-office-logistics-log',
            component: HeadOfficeLogisticsLogView
        },

        // --- Factory Routes ---
        {
            path: '/factory/orders',
            name: 'factory-order-list',
            component: FactoryOrderListView
        },
        {
            path: '/factory/inbound',
            name: 'factory-inbound',
            component: FactoryInboundView
        },
        {
            path: '/factory/outbound',
            name: 'factory-outbound',
            component: FactoryOutboundView
        },
        {
            path: '/factory/orders/request',
            name: 'factory-order-request',
            component: FactoryOrderRequestView
        },
        {
            path: '/head-office/orders/vehicle-assignment',
            name: 'head-office-vehicle-assignment',
            component: HeadOfficeVehicleAssignmentView
        },
        {
            path: '/head-office/returns/vehicle-assignment',
            name: 'head-office-return-vehicle-assignment',
            component: HeadOfficeReturnVehicleAssignmentView
        },
        {
            path: '/store/settlement',
            name: 'store-settlement-summary',
            component: () => import('@/views/store-settlement/StoreSettlementSummaryView.vue')
        },
        {
            path: '/store/settlement/items',
            name: 'store-settlement-items',
            component: () => import('@/views/store-settlement/StoreSettlementItemSummaryView.vue')
        },
        {
            path: '/store/settlement/vouchers',
            name: 'store-settlement-vouchers',
            component: () => import('@/views/store-settlement/StoreSettlementVoucherListView.vue')
        },
        {
            path: '/hq/settlement',
            name: 'hq-settlement-list',
            component: () => import('@/views/hq-settlement/HqSettlementListView.vue')
        },
        {
            path: '/hq/settlement/confirm',
            name: 'hq-settlement-confirm',
            component: () => import('@/views/hq-settlement/HqSettlementConfirmView.vue')
        },
        {
            path: '/hq/settlement/detail/:storeId',
            name: 'hq-settlement-detail',
            component: () => import('@/views/hq-settlement/HqSettlementDetailView.vue')
        },
        {
            path: '/hq/settlement/summary-detail',
            name: 'hq-settlement-summary-detail',
            component: () => import('@/views/hq-settlement/HqSettlementSummaryDetailView.vue')
        },
        {
            path: '/hq/settlement/voucher-manage',
            name: 'hq-settlement-voucher-manage',
            component: () => import('@/views/hq-settlement/HqSettlementVoucherManageView.vue')
        },
        {
            path: '/hq/settlement/logs',
            name: 'hq-settlement-logs',
            component: () => import('@/views/hq-settlement/HqSettlementLogView.vue')
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
