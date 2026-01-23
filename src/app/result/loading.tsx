// import ResultsSkeleton from './page';

export default function Loading() {
    // We can't easily export/import the skeleton if it's not exported from page,
    // so let's just inline a similar skeleton or export it.
    // Actually, let's just duplicate the skeleton structure for simplicity and speed.
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="px-8 py-5 bg-[#003d7c] text-white flex justify-between items-center">
                <div className="text-2xl font-bold tracking-wide">Degree-folio</div>
                <div className="text-sm opacity-80">Beta v1.0</div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="my-8">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>

                <div className="mb-10 p-6 bg-white rounded-xl shadow-sm border border-blue-100 animate-pulse">
                    <div className="h-6 bg-gray-200 w-1/4 mb-4 rounded"></div>
                    <div className="flex gap-2">
                        <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-[300px] animate-pulse">
                            <div className="p-1 bg-gray-200 h-2" />
                            <div className="p-6">
                                <div className="mb-3 flex gap-2">
                                    <div className="h-5 w-16 bg-gray-200 rounded-full" />
                                    <div className="h-5 w-16 bg-gray-200 rounded-full" />
                                </div>
                                <div className="h-6 bg-gray-200 w-3/4 mb-2 rounded" />
                                <div className="h-6 bg-gray-200 w-1/2 mb-4 rounded" />
                                <div className="h-20 bg-gray-200 rounded mb-4" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
