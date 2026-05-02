import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface VideoEmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoPos: number | null;
  editor: Editor | null;
}

export function VideoEmbedDialog({ open, onOpenChange, videoPos, editor }: VideoEmbedDialogProps) {
  const [videoUrl, setVideoUrl] = useState('');

  const submitVideo = () => {
    if (videoUrl && editor) {
      editor.chain().focus()
        .setTextSelection(videoPos !== null ? videoPos : editor.state.selection.from)
        .setYoutubeVideo({ src: videoUrl })
        .run();
      setVideoUrl('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-neutral-800 bg-neutral-900/95 backdrop-blur-xl p-6 shadow-2xl sm:rounded-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-white">
              Embed Video
            </Dialog.Title>
            <Dialog.Description className="text-sm text-neutral-400">
              Enter a YouTube URL to embed a video in your document.
            </Dialog.Description>
          </div>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 placeholder:text-neutral-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitVideo();
                  if (e.key === 'Escape') onOpenChange(false);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="mt-2 sm:mt-0 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitVideo}
              className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-sm font-medium transition-colors"
            >
              Embed Video
            </button>
          </div>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4 text-neutral-400" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
