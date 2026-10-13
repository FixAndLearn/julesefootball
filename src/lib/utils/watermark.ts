/**
 * Squad Screenshot Auto-Watermarking Utility
 * Protects eFootball squad screenshots against theft, Facebook/WhatsApp scam reposts,
 * and impersonation by embedding an indelible eFootballMarket Escrow watermark.
 */

export interface WatermarkOptions {
  sellerUsername?: string;
  watermarkText?: string;
  websiteUrl?: string;
}

/**
 * Applies a tamper-resistant security watermark to an image File using HTML Canvas.
 * Returns a new File object ready for upload.
 */
export async function watermarkSquadImage(
  file: File,
  options: WatermarkOptions = {}
): Promise<File> {
  // If not running in browser environment, return original file
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  const {
    sellerUsername = "Verified Seller",
    websiteUrl = "efootballmarket.co.ke",
  } = options;

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(file);
            return;
          }

          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          const w = canvas.width;
          const h = canvas.height;

          // Draw the base image
          ctx.drawImage(img, 0, 0, w, h);

          // ------------------------------------------------------------------
          // 1. Subtle Diagonal Security Overlay Pattern across the center
          // ------------------------------------------------------------------
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate((-25 * Math.PI) / 180);

          const fontSizeCenter = Math.max(16, Math.round(w * 0.032));
          ctx.font = `900 ${fontSizeCenter}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Center watermark stamp
          ctx.fillText(`🛡️ ${websiteUrl.toUpperCase()} | ESCROW PROTECTED`, 0, -fontSizeCenter);

          ctx.font = `700 ${Math.round(fontSizeCenter * 0.65)}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = "rgba(245, 158, 11, 0.22)"; // amber-tinted
          ctx.fillText(`SELLER: @${sellerUsername.toUpperCase()} | NO DIRECT HANDOVERS`, 0, fontSizeCenter);

          ctx.restore();

          // ------------------------------------------------------------------
          // 2. High-Tech Bottom Escrow Security Ribbon
          // ------------------------------------------------------------------
          const ribbonHeight = Math.max(34, Math.round(h * 0.055));
          const yPos = h - ribbonHeight;

          // Dark gradient backdrop
          const ribbonGradient = ctx.createLinearGradient(0, yPos, w, yPos);
          ribbonGradient.addColorStop(0, "rgba(2, 6, 23, 0.92)");
          ribbonGradient.addColorStop(0.5, "rgba(15, 23, 42, 0.88)");
          ribbonGradient.addColorStop(1, "rgba(2, 6, 23, 0.92)");

          ctx.fillStyle = ribbonGradient;
          ctx.fillRect(0, yPos, w, ribbonHeight);

          // Top border line on ribbon (emerald neon glow)
          ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
          ctx.fillRect(0, yPos, w, Math.max(2, Math.round(h * 0.003)));

          // Ribbon Text
          const ribbonFontSize = Math.max(12, Math.round(ribbonHeight * 0.38));
          ctx.font = `800 ${ribbonFontSize}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = "#10B981"; // Emerald
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText("🛡️ ESCROW VERIFIED ASSET", Math.max(12, Math.round(w * 0.02)), yPos + ribbonHeight / 2);

          ctx.font = `600 ${Math.max(11, Math.round(ribbonHeight * 0.34))}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = "#F8FAFC"; // White text
          ctx.textAlign = "right";
          ctx.fillText(
            `${websiteUrl} — Safe M-Pesa Till 1572931`,
            w - Math.max(12, Math.round(w * 0.02)),
            yPos + ribbonHeight / 2
          );

          // Convert canvas back to file
          const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              const watermarkedFile = new File([blob], file.name, {
                type: outputType,
                lastModified: Date.now(),
              });

              resolve(watermarkedFile);
            },
            outputType,
            0.92 // 92% high quality
          );
        } catch (err) {
          console.warn("Watermarking failed, falling back to original image:", err);
          resolve(file);
        }
      };

      img.onerror = () => {
        resolve(file);
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      } else {
        resolve(file);
      }
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}
