# Docker Panel Applet (Cinnamon)

A simple Cinnamon panel applet to monitor Docker containers in real time.

## Screenshots > text



## How it works

The applet listens to Docker events and keeps a small internal state updated.
The CPU and memory impact is virtually null (developped on a way too old
computer :)

This is a small personal tool, not a full Docker dashboard.  
It’s meant to stay lightweight and fast, not feature-heavy.

## Requirements

- Docker installed and running
- Cinnamon desktop environment
- `docker` CLI available in PATH
- A terminal emulator (default: `xfce4-terminal`)

## Installation

Clone or copy the folder into:

~~~
~/.local/share/cinnamon/applets/
~~~

Then restart Cinnamon:

~~~
Alt + F2 → r
~~~

(or log out / log in if you're on Wayland)

Then enable it in:
**System Settings → Applets**

## Configuration

No configuration needed.  
Everything is automatic.

## License

Do whatever the hell you want with it.
