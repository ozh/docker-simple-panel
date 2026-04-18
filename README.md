# Docker Panel Applet (Cinnamon)

A simple Cinnamon panel applet to monitor Docker containers in real time.

## What it does

The applet shows at a glance if you have containers running

| What | Icon |
|------|------|
| Icon with overall status | <img width="262" height="114" alt="1" src="https://github.com/user-attachments/assets/f5592eb7-fa6f-4659-89c3-4b6dbed3d41f" /> |
| Docker icon with green badge means containers are running.<br/>Clicking on a container will display logs into a terminal | <img width="305" height="310" alt="2" src="https://github.com/user-attachments/assets/64bfae70-b748-4782-bd98-8e8b8b3e139e" /> |
| Grey docker icon = no container is running | <img width="162" height="201" alt="3" src="https://github.com/user-attachments/assets/f8ad77ba-8bc3-4b8b-ba3a-70d475332c37" /> |
| Red docker icon = one or several containers stopped | <img width="375" height="282" alt="4" src="https://github.com/user-attachments/assets/fbfff3d9-847f-4e5d-89ca-0e9e49d681f1" /> |


## How it works

The applet listens to Docker events and keeps a small internal state updated. The CPU and memory impact is virtually null (developped on a way too old computer :)

This is a small personal tool, not a full Docker dashboard. It’s meant to stay lightweight and fast, not feature-heavy.

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

Rename the new folder to `docker-simple-panel@ozh`

Restart Cinnamon:

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
