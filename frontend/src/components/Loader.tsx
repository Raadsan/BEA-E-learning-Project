export default function Loader({ fullPage = false }) {
    return (
        <div className={`flex flex-col justify-center items-center p-8 gap-3 ${fullPage ? 'min-h-[60vh]' : ''}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Loading...</p>
        </div>
    );
}
