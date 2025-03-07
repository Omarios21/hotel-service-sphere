import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  onScanSuccess, 
  onScanFailure 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const qrBoxSize = 250;

  useEffect(() => {
    // Initialize scanner
    const newScanner = new Html5Qrcode('reader');
    setScanner(newScanner);

    // Cleanup on unmount
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(error => console.error('Error stopping scanner:', error));
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scanner) return;

    setIsScanning(true);
    
    const config = {
      fps: 10,
      qrbox: { width: qrBoxSize, height: qrBoxSize },
      aspectRatio: 1.0
    };

    try {
      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanFailure) {
            onScanFailure(errorMessage);
          }
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
        setIsScanning(false);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanner();
    onScanSuccess(decodedText);
  };

  return (
    <div className="flex flex-col items-center">
      <Card className="p-4 w-full max-w-md bg-background">
        <div 
          id="reader" 
          className="w-full aspect-square max-w-md overflow-hidden rounded-lg bg-black"
        ></div>
        
        <div className="mt-4 flex justify-center">
          {!isScanning ? (
            <Button onClick={startScanner} className="w-full">
              Scan QR Code
            </Button>
          ) : (
            <Button onClick={stopScanner} variant="outline" className="w-full">
              Cancel Scan
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default QRScanner;
