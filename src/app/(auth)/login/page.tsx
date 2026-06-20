import { AuthCard } from "@/features/auth/components/auth-card";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
 const params = await searchParams;

 return (
 <main className="relative grid min-h-screen place-items-center overflow-hidden p-4">
 {/* Animated gradient background */}
 <div className="fixed inset-0 -z-10 bg-[#0a0a0f]">
 {/* Primary gradient blob */}
 <div
 className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
 style={{
 background: "radial-gradient(circle, hsl(220 70% 55%) 0%, hsl(280 60% 45%) 50%, transparent 70%)",
 animation: "loginPulse 8s ease-in-out infinite",
 }}
 />
 {/* Secondary accent blob */}
 <div
 className="absolute left-[20%] top-[30%] h-[400px] w-[400px] rounded-full opacity-15 blur-[100px]"
 style={{
 background: "radial-gradient(circle, hsl(180 60% 50%) 0%, transparent 70%)",
 animation: "loginFloat 12s ease-in-out infinite",
 }}
 />
 {/* Tertiary warm blob */}
 <div
 className="absolute right-[15%] bottom-[20%] h-[350px] w-[350px] rounded-full opacity-10 blur-[90px]"
 style={{
 background: "radial-gradient(circle, hsl(30 80% 55%) 0%, transparent 70%)",
 animation: "loginFloat 10s ease-in-out 2s infinite reverse",
 }}
 />
 {/* Grid overlay */}
 <div
 className="absolute inset-0 opacity-[0.03]"
 style={{
 backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
 backgroundSize: "60px 60px",
 }}
 />
 {/* Floating particles */}
 {[...Array(6)].map((_, i) => (
 <div
 key={i}
 className="absolute rounded-full bg-white/20"
 style={{
 width: `${3 + (i % 3) * 2}px`,
 height: `${3 + (i % 3) * 2}px`,
 left: `${15 + i * 14}%`,
 top: `${20 + ((i * 17) % 60)}%`,
 animation: `loginParticle ${6 + i * 2}s ease-in-out ${i * 0.8}s infinite`,
 }}
 />
 ))}
 </div>

 <AuthCard message={params.message} />

 <style>{`
 @keyframes loginPulse {
 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
 50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.3; }
 }
 @keyframes loginFloat {
 0%, 100% { transform: translateY(0) translateX(0); }
 33% { transform: translateY(-30px) translateX(20px); }
 66% { transform: translateY(20px) translateX(-15px); }
 }
 @keyframes loginParticle {
 0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
 50% { transform: translateY(-40px) scale(1.5); opacity: 0.5; }
 }
 `}</style>
 </main>
 );
}
