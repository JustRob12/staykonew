import { MyPropertiesList } from '@/components/MyPropertiesList'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'


export default function MyPropertiesPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="group p-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all duration-200">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Properties</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage your listed spaces</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-green-100 shadow-xl shadow-green-900/5 min-h-[600px] p-1">
                    <MyPropertiesList />
                </div>
            </div>
        </div>
    )
}
