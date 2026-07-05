import { Dialog, DialogContent } from './ui/dialog'

interface QrViewerProps {
  url: string
  name: string
  open: boolean
  onClose: () => void
}

export function QrViewer({ url, name, open, onClose }: QrViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm font-medium">{name}</p>
          <img
            src={url}
            alt={`QR của ${name}`}
            className="w-64 h-64 rounded-lg object-contain bg-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
