import json
import easyocr
from http.server import BaseHTTPRequestHandler, HTTPServer
import sys


def make_handler(languages, model_dir):
    print("Initializing OCR reader (this takes a while)", flush=True)
    ocr_reader = easyocr.Reader(languages, model_storage_directory=model_dir)
    print("Finished initializing OCR reader", flush=True)

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            print("Got request in OCR server:", flush=True)
            print(self.headers)

            content_length = int(self.headers.get("Content-Length"))
            image = self.rfile.read(content_length)

            try:
                result = (self.get_entries(image), None)
            except Exception as e:
                result = (None, e)

            entries, error = result

            if error:
                print("Error reading text from image", error, flush=True)
                self.send_error(400)
                self.end_headers()
            else:
                print(f"Read {len(entries)} entries succesfully", flush=True)

                output = json.dumps(
                    entries, ensure_ascii=False).encode("utf-8")

                self.send_response(200)
                self.send_header(
                    "Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", len(output))
                self.end_headers()

                self.wfile.write(output)

        def get_entries(self, image: bytes):
            results = ocr_reader.readtext(image)
            entries = []

            for result in results:
                coords_int64, text, confidence = result
                coords = []

                for coord_int64 in coords_int64:
                    x, y = coord_int64
                    coord = (int(x), int(y))
                    coords.append(coord)

                entry = {"text": text,
                         "confidence": confidence, "coords": coords}
                entries.append(entry)

            return entries
    return Handler


def main():
    port = int(sys.argv[1])
    languages = sys.argv[2].split(",")
    model_dir = sys.argv[3]

    print("Launched OCR server", port, languages, model_dir, flush=True)

    with HTTPServer(('localhost', port), make_handler(languages, model_dir)) as server:
        print("[READY] Starting OCR HTTP Server on port {port}", flush=True)
        server.serve_forever()

    print(f"OCR HTTP Server stopped", flush=True)


if __name__ == "__main__":
    main()
