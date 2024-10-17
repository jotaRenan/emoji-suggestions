import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "result";
/**
 * 1. ✅ move emoji creation section into a native <dialog> component;
 * 2. implement multiple strategies for resizing:
 *   a. using third library locally;
 *   b. server-side processing base64;
 *   c. server-side processing Stream;
 * 3. add new emoji to list of emojis
 * 4. support gifs
 * 5. persist emoji
 */

export const NewEmojiSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<Blob | null>();
  const [savedImage, setSavedImage] = useState<string | null>(null);

  useEffect(() => {
    setSavedImage(window.localStorage.getItem("result"));
  }, []);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const fileUrl = useMemo(() => {
    return file === null ? null : URL.createObjectURL(file);
  }, [file]);

  return (
    <section>
      <button onClick={() => dialogRef.current?.showModal()}>
        Create new emoji
      </button>
      <img src={savedImage ?? undefined} alt="" />

      <dialog ref={dialogRef}>
        <button onClick={() => dialogRef.current?.close()}>Close</button>
        <div>
          <label htmlFor="uploader" style={{ display: "block" }}>
            Send your cool emoji
          </label>
          <input
            id="uploader"
            type="file"
            onChange={(e) => {
              const uploadedFile = e.target.files?.item(0);
              if (!uploadedFile) {
                setFile(null);
                return;
              }
              setFile(uploadedFile);
            }}
          />
          {fileUrl && (
            <img
              alt=""
              ref={imgRef}
              src={fileUrl}
              width={450}
              onLoad={() => {
                const canvas = canvasRef.current;
                const img = imgRef.current;

                if (!canvas || !img) {
                  throw new Error("canvas or img not defined");
                }

                function handleGeneratedBlob(blob: Blob | null) {
                  if (!blob) {
                    setOutputImage(null);
                    throw new Error("unable to create image");
                  }
                  setOutputImage(blob);
                  read(blob).then((str) => {
                    setSavedImage(str);
                    localStorage.setItem(STORAGE_KEY, str);
                  });
                }

                makeResizedImage(canvas, img, handleGeneratedBlob);
              }}
            />
          )}
          <canvas ref={canvasRef} width={30} />
        </div>
        <button
          disabled={!outputImage}
          onClick={() => {
            if (!outputImage) {
              throw new Error("output image is unavailable");
            }
            downloadBlob(outputImage);
          }}
        >
          download
        </button>
      </dialog>
    </section>
  );
};

function makeResizedImage(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  handleGeneratedBlob: (x: Blob | null) => void
) {
  // canvas resizing algorithm taken from here:
  // https://stackoverflow.com/a/19262385
  // set size proportional to image
  canvas.height = canvas.width * (img.height / img.width);

  // step 1 - resize to 50%
  const oc = document.createElement("canvas"),
    octx = oc.getContext("2d");

  const ctx = canvas.getContext("2d");
  if (!octx || !ctx) {
    throw new Error("octx or ctx not defined");
  }
  oc.width = img.width * 0.5;
  oc.height = img.height * 0.5;
  octx.drawImage(img, 0, 0, oc.width, oc.height);

  // step 2
  octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

  // step 3, resize to final size
  ctx.drawImage(
    oc,
    0,
    0,
    oc.width * 0.5,
    oc.height * 0.5,
    0,
    0,
    canvas.width,
    canvas.height
  );
  canvas.toBlob(handleGeneratedBlob, "image/png", 1);
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "download";

  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      removeEventListener("click", clickHandler);
    }, 150);
  };

  a.addEventListener("click", clickHandler, false);
  a.click();
}

function read(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
