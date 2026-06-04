import os
import sys
import webview

def get_entry_point():
    # If compiled with PyInstaller, the bundle folder is sys._MEIPASS
    if getattr(sys, 'frozen', False):
        return os.path.join(sys._MEIPASS, 'index.html')
    return 'index.html'

if __name__ == '__main__':
    entry_point = get_entry_point()
    
    # Create the window running our local Web app
    window = webview.create_window(
        title='IT Asset Agreement Automator',
        url=entry_point,
        width=1350,
        height=850,
        resizable=True,
        min_size=(1000, 700)
    )
    
    # Launch pywebview. It will spin up a local random port HTTP server
    # to serve the static index.html, style.css, and app.js assets offline.
    webview.start(private_mode=False)
