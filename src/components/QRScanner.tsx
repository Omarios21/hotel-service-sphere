
import React, { useState } from 'react';
import { QrCode, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (roomId: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  
  // Simulate QR code scanning
  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate a successful scan after a delay
    setTimeout(() => {
      setIsScanning(false);
      // Pass a mock room ID (in real app, this would come from the QR code)
      onScan('101');
    }, 2000);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative w-64 h-64 border-2 rounded-lg overflow-hidden ${
          isScanning ? 'border-primary' : 'border-border'
        }`}
      >
        {isScanning ? (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <RefreshCw className="h-10 w-10 text-primary animate-spin-slow" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
            <QrCode className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Scanning animation */}
        {isScanning && (
          <div 
            className="absolute h-1 w-full bg-primary/70 animate-ping"
            style={{
              animation: 'scanLine 2s linear infinite',
            }}
          />
        )}
      </div>
      
      <button
        onClick={handleScan}
        disabled={isScanning}
        className={`mt-8 px-6 py-3 rounded-full font-medium transition-all 
          ${isScanning 
            ? 'bg-muted text-muted-foreground cursor-not-allowed' 
            : 'bg-primary text-primary-foreground hover:opacity-90 shadow-md'
          }`}
      >
        {isScanning ? 'Scanning...' : 'Scan QR Code'}
      </button>
      
      <p className="mt-4 text-sm text-muted-foreground max-w-xs text-center">
        Scan the QR code provided by the reception desk to access hotel services.
      </p>
      
      <style jsx>{`
        @keyframes scanLine {
          0% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
