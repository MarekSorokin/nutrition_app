'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { searchFood, searchOnline } from '@/app/actions';
import { useAppStore } from '@/lib/store/app-store';
import { toast } from 'sonner';
import { AddCustomFoodModal } from './add-custom-food-modal';

interface BarcodeScannerProps {
  onClose: () => void;
  onScan?: (barcode: string) => void;
}

export function BarcodeScanner({ onClose, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const controlsRef = useRef<IScannerControls | null>(null);
  const { setSearchResults, setDisplaySearchResults } = useAppStore();
  const [showAddCustomFood, setShowAddCustomFood] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    async function requestCameraPermission() {
      console.log('Requesting camera permission...');

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('mediaDevices API not supported');
        setPermissionDenied(true);
        return false;
      }

      try {
        console.log('Attempting to access camera...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch (error) {
        console.error('Permission error:', error);
        setPermissionDenied(true);
        return false;
      }
    }

    async function setupScanner() {
      try {
        if (!videoRef.current) return;

        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          toast.error('Camera permission is required');
          return;
        }

        setIsScanning(true);

        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        controlsRef.current = await codeReader.decodeFromConstraints(
          constraints,
          videoRef.current,
          async (result) => {
            if (result) {
              const barcode = result.getText();
              setScannedBarcode(barcode);
              toast.info('Barcode detected: ' + barcode);

              // If onScan is provided, use it directly
              if (onScan) {
                onScan(barcode);
                return;
              }

              try {
                // First check our database
                const localResults = await searchFood(barcode);
                if (localResults.products.length > 0) {
                  setSearchResults(localResults);
                  setDisplaySearchResults(true);
                  onClose();
                  return;
                }

                // Then check Open Food Facts
                const response = await fetch(
                  `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
                );
                const data = await response.json();

                if (data.status === 1) {
                  const results = await searchOnline(data.product.product_name);
                  setSearchResults(results);
                  setDisplaySearchResults(true);
                  onClose();
                } else {
                  toast.error('Product not found');
                  setShowAddCustomFood(true);
                }
              } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Failed to fetch product information');
                setShowAddCustomFood(true);
              }
            }
          },
        );
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast.error('Failed to access camera. Please check camera permissions.');
        setPermissionDenied(true);
      }
    }

    setupScanner();

    return () => {
      controlsRef.current?.stop();
      setIsScanning(false);
    };
  }, [onClose, setSearchResults, setDisplaySearchResults, onScan]);

  const handleRetry = async () => {
    setPermissionDenied(false);
    setIsScanning(false);
    window.location.reload();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-x-0 top-0 z-50 bg-background p-6 shadow-lg">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <h2 className="text-lg font-semibold">Scan Barcode</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-black">
            <video
              ref={videoRef}
              className="h-full w-full"
              playsInline
              autoPlay
              muted
              style={{ objectFit: 'cover' }}
            />
            {!isScanning && !permissionDenied && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Camera className="mx-auto mb-2 size-8" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}
            {permissionDenied && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white p-4">
                  <Camera className="mx-auto mb-2 size-8" />
                  <p className="mb-4">Camera access is required to scan barcodes.</p>
                  <p className="mb-4 text-sm">
                    Please allow camera access in your browser settings.
                  </p>
                  <Button onClick={handleRetry} variant="secondary">
                    Retry Camera Access
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddCustomFood && !onScan && (
        <AddCustomFoodModal
          barcode={scannedBarcode}
          onClose={() => {
            setShowAddCustomFood(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
