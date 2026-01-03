'use client'

import { useState, useEffect } from 'react'
import { Loader2, Database, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Profile, Business, Campaign } from '@/types/database'

type BusinessWithUser = Business & {
    profiles: { name: string | null; email: string } | null
}

type CampaignWithBusiness = Campaign & {
    businesses: { name: string } | null
}

type TableType = 'users' | 'businesses' | 'campaigns'

export default function DataManagementPage() {
    const [activeTab, setActiveTab] = useState<TableType>('users')
    const [loading, setLoading] = useState(true)

    // Users
    const [users, setUsers] = useState<Profile[]>([])
    const [usersPage, setUsersPage] = useState(1)
    const [usersTotal, setUsersTotal] = useState(0)
    const [usersSortAsc, setUsersSortAsc] = useState(true)

    // Businesses
    const [businesses, setBusinesses] = useState<BusinessWithUser[]>([])
    const [businessesPage, setBusinessesPage] = useState(1)
    const [businessesTotal, setBusinessesTotal] = useState(0)
    const [businessesSortAsc, setBusinessesSortAsc] = useState(true)

    // Campaigns
    const [campaigns, setCampaigns] = useState<CampaignWithBusiness[]>([])
    const [campaignsPage, setCampaignsPage] = useState(1)
    const [campaignsTotal, setCampaignsTotal] = useState(0)
    const [campaignsSortAsc, setCampaignsSortAsc] = useState(true)

    const ITEMS_PER_PAGE = 10

    useEffect(() => {
        loadData()
    }, [activeTab, usersPage, usersSortAsc, businessesPage, businessesSortAsc, campaignsPage, campaignsSortAsc])

    const loadData = async () => {
        setLoading(true)
        try {
            if (activeTab === 'users') {
                await loadUsers()
            } else if (activeTab === 'businesses') {
                await loadBusinesses()
            } else if (activeTab === 'campaigns') {
                await loadCampaigns()
            }
        } catch (error) {
            console.error('Error loading data:', error)
            alert('Error loading data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const loadUsers = async () => {
        try {
            const response = await fetch(
                `/api/admin/users?page=${usersPage}&sort=${usersSortAsc ? 'asc' : 'desc'}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }

            const { data, count } = await response.json()
            setUsers(data || [])
            setUsersTotal(count || 0)
        } catch (error) {
            console.error('Error loading users:', error)
            throw error
        }
    }

    const loadBusinesses = async () => {
        try {
            const response = await fetch(
                `/api/admin/businesses?page=${businessesPage}&sort=${businessesSortAsc ? 'asc' : 'desc'}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch businesses')
            }

            const { data, count } = await response.json()
            setBusinesses(data || [])
            setBusinessesTotal(count || 0)
        } catch (error) {
            console.error('Error loading businesses:', error)
            throw error
        }
    }

    const loadCampaigns = async () => {
        try {
            const response = await fetch(
                `/api/admin/campaigns?page=${campaignsPage}&sort=${campaignsSortAsc ? 'asc' : 'desc'}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch campaigns')
            }

            const { data, count } = await response.json()
            setCampaigns(data || [])
            setCampaignsTotal(count || 0)
        } catch (error) {
            console.error('Error loading campaigns:', error)
            throw error
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const Pagination = ({
        currentPage,
        totalItems,
        onPageChange
    }: {
        currentPage: number
        totalItems: number
        onPageChange: (page: number) => void
    }) => {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

        return (
            <div className="flex items-center justify-between mt-6 px-4">
                <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-4 text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-amber-400 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and view all system data
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'users'
                            ? 'bg-amber-400 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Users ({usersTotal})
                    </button>
                    <button
                        onClick={() => setActiveTab('businesses')}
                        className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'businesses'
                            ? 'bg-amber-400 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Businesses ({businessesTotal})
                    </button>
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'campaigns'
                            ? 'bg-amber-400 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Campaigns ({campaignsTotal})
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <>
                            {/* Users Table */}
                            {activeTab === 'users' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">Users</h2>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setUsersSortAsc(!usersSortAsc)}
                                        >
                                            <ArrowUpDown className="w-4 h-4 mr-2" />
                                            {usersSortAsc ? 'A-Z' : 'Z-A'}
                                        </Button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm">{user.name || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">{user.email}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                                user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{user.auth_provider}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.email_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {user.email_verified ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        currentPage={usersPage}
                                        totalItems={usersTotal}
                                        onPageChange={setUsersPage}
                                    />
                                </div>
                            )}

                            {/* Businesses Table */}
                            {activeTab === 'businesses' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">Businesses</h2>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setBusinessesSortAsc(!businessesSortAsc)}
                                        >
                                            <ArrowUpDown className="w-4 h-4 mr-2" />
                                            {businessesSortAsc ? 'A-Z' : 'Z-A'}
                                        </Button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIB</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {businesses.map((business) => (
                                                    <tr key={business.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium">{business.name}</td>
                                                        <td className="px-4 py-3 text-sm">{business.owner_name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {business.profiles?.email || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${business.product_category === 'PRODUK'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-green-100 text-green-700'
                                                                }`}>
                                                                {business.product_category || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{business.nib || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(business.created_at)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        currentPage={businessesPage}
                                        totalItems={businessesTotal}
                                        onPageChange={setBusinessesPage}
                                    />
                                </div>
                            )}

                            {/* Campaigns Table */}
                            {activeTab === 'campaigns' && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">Campaigns</h2>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCampaignsSortAsc(!campaignsSortAsc)}
                                        >
                                            <ArrowUpDown className="w-4 h-4 mr-2" />
                                            {campaignsSortAsc ? 'A-Z' : 'Z-A'}
                                        </Button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign Title</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {campaigns.map((campaign) => (
                                                    <tr key={campaign.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium">{campaign.title}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {campaign.businesses?.name || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{campaign.brand_name}</td>
                                                        <td className="px-4 py-3 text-sm">{campaign.customer_name}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                                campaign.status === 'RECORDED' ? 'bg-blue-100 text-blue-700' :
                                                                    campaign.status === 'INVITED' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {campaign.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{campaign.invite_method || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(campaign.created_at)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        currentPage={campaignsPage}
                                        totalItems={campaignsTotal}
                                        onPageChange={setCampaignsPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
