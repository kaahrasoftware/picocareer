import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage: string | null;
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  onImageLoad: (img: HTMLImageElement) => void;
  onSave: () => void;
  uploading: boolean;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  selectedImage,
  crop,
  onCropChange,
  onImageLoad,
  onSave,
  uploading
}: ImageCropDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>
        {selectedImage && (
          <div className="relative max-h-[500px] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={onCropChange}
              aspect={1}
              circularCrop
            >
              <img
                src={selectedImage}
                alt="Crop preview"
                onLoad={(e) => onImageLoad(e.currentTarget)}
              />
            </ReactCrop>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onSave} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}