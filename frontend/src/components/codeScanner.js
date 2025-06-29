import React, { useEffect, useState } from "react";
import * as Quagga from "quagga"; // import all of Quagga

/**
 * A simple barcode scanner that only fires once per scan
 * and then shows a “Scan again?” button.
 */
export default function CodeScanner({ onDetected }) {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;

    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#scanner"),
          constraints: {
            facingMode: "environment",
            width: 480,
            height: 320,
          },
        },
        decoder: {
          readers: ["ean_reader"], // most food barcodes
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error("Quagga init failed:", err);
          return;
        }
        Quagga.start();
      }
    );

    const onDetectedCallback = (data) => {
      Quagga.offDetected(onDetectedCallback);
      Quagga.stop();
      setScanning(false);
      onDetected(data.codeResult.code);
    };

    Quagga.onDetected(onDetectedCallback);

    return () => {
      // cleanup on unmount
      if (Quagga.stop) Quagga.stop();
      Quagga.offDetected(onDetectedCallback);
    };
  }, [scanning, onDetected]);

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        id="scanner"
        style={{ width: "100%", height: 300, background: "#000" }}
      ></div>
      {!scanning && (
        <button onClick={() => setScanning(true)}>Scan again?</button>
      )}
    </div>
  );
}
