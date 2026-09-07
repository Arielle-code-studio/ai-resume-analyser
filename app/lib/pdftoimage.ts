export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) {
        console.log("PDF.js already loaded");
        return pdfjsLib;
    }

    if (loadPromise) {
        console.log("PDF.js is currently loading");
        return loadPromise;
    }

    isLoading = true;

    console.log("Loading PDF.js...");

    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs")
        .then((lib) => {
            console.log("PDF.js IMPORT SUCCESS:", lib);

            lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

            console.log("PDF.js worker set to:", "/pdf.worker.min.mjs");

            pdfjsLib = lib;
            isLoading = false;

            return lib;
        })
        .catch((error) => {
            console.error("PDF.js IMPORT FAILED:", error);
            isLoading = false;
            throw error;
        });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();
        console.log("PDF.js loaded successfully");

        const arrayBuffer = await file.arrayBuffer();
        console.log("PDF converted to ArrayBuffer");
        console.log("Trying to load PDF document...");

        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

        console.log("PDF document loaded successfully:", pdf);
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        await page.render({ canvasContext: context!, viewport }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0
            ); // Set quality to maximum (1.0)
        });
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}