import io
import json
import PIL.Image
import easyocr
import manga_ocr
from http.server import BaseHTTPRequestHandler, HTTPServer
import sys
import os


def make_handler():
    print("Initializing EasyOCR reader...", flush=True)
    easyocr_reader = easyocr.Reader(["ja"])

    print("Initializing MangaOCR reader...", flush=True)
    mangaocr_reader = manga_ocr.MangaOcr()

    print("Finished OCR readers!", flush=True)

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            print("Got request in OCR server", self.headers, flush=True)

            content_length = int(self.headers.get("Content-Length"))
            image_bytes = self.rfile.read(content_length)
            ocr_results = self.scan_image(image_bytes)
            response_body = json.dumps(
                ocr_results, ensure_ascii=False).encode("utf-8")

            self.send_response(200)
            self.send_header(
                "Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", len(response_body))
            self.end_headers()

            self.wfile.write(response_body)

        def scan_image(self, image_bytes: bytes):
            results = {}

            try:
                results["easy_ocr"] = self.scan_image_easyocr(image_bytes)
            except Exception as e:
                print("EasyOCR scan failed", e, flush=True)
                results["easy_ocr"] = []

            try:
                image = PIL.Image.open(io.BytesIO(image_bytes))
                results["manga_ocr"] = [{"text": mangaocr_reader(image)}]
            except Exception as e:
                print("MangaOCR scan failed", e, flush=True)
                results["manga_ocr"] = []

            return results

        def scan_image_easyocr(self, image_bytes: bytes):
            results = easyocr_reader.readtext(image_bytes)
            entries = []

            for result in results:
                _, text, confidence = result
                entry = {"text": text, "confidence": confidence}
                entries.append(entry)

            return entries

    return Handler


def main():
    port = int(sys.argv[1])

    print("Launched OCR server", port, os.environ.get(
        "EASYOCR_MODULE_PATH"), os.environ.get("TRANSFORMERS_CACHE"), flush=True)

    with HTTPServer(('localhost', port), make_handler()) as server:
        print(f"[READY] Starting OCR HTTP Server on port {port}", flush=True)
        server.serve_forever()

    print(f"OCR HTTP Server stopped", flush=True)


if __name__ == "__main__":
    main()
