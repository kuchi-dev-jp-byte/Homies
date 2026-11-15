"""Local-only SPA preview of `npm run build:web`."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial

DIST = Path(__file__).resolve().parent.parent / 'dist'

class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if not Path(self.translate_path(self.path)).is_file() and '.' not in self.path.rsplit('/', 1)[-1]:
            self.path = '/index.html'
        super().do_GET()

print('Homies preview: http://localhost:8083', flush=True)
ThreadingHTTPServer(('127.0.0.1', 8083), partial(SPAHandler, directory=str(DIST))).serve_forever()
