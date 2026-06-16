import { Scissors } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#ffea00]/10">
          <Scissors className="size-8 animate-pulse text-[#ffea00]" />
        </div>
        <div>
          <p className="font-semibold text-white">Carregando...</p>
          <p className="text-sm text-[#555]">Aguarde um momento</p>
        </div>
      </div>
    </div>
  )
}
