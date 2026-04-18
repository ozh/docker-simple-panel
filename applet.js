const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const PopupMenu = imports.ui.popupMenu;
const ByteArray = imports.byteArray;
const Gio = imports.gi.Gio;

class DockerApplet extends Applet.TextIconApplet {
    constructor(metadata, orientation, panelHeight, instanceId) {
        super(orientation, panelHeight, instanceId);

        this.set_applet_label("0");
        this.set_applet_tooltip("Docker containers");

        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        this._lastState = { running: [], stopped: [] };
        this._lastStateHash = "";

        this.menu.connect("open-state-changed", (menu, open) => {
            if (open) this._rebuildMenu();
        });

        // Initial state snapshot
        this._syncState();

        // Event-driven updates
        this._startEvents();
    }

    // -------------------------
    // RUN COMMAND
    // -------------------------

    _run(cmd) {
        try {
            let [ok, out] = GLib.spawn_command_line_sync(cmd);
            if (!ok || !out) return "";
            return ByteArray.toString(out).trim();
        } catch (e) {
            global.logError(e);
            return "";
        }
    }

    // -------------------------
    // STATE PARSING
    // -------------------------

    _getState() {
        let raw = this._run("docker ps -a --format '{{.Names}}|{{.Status}}'");

        let running = [];
        let stopped = [];

        if (!raw) return { running, stopped };

        raw.split("\n").forEach(line => {
            if (!line) return;

            let [name, status] = line.split("|");
            if (!name || !status) return;

            let isRunning =
                !status.toLowerCase().includes("exited") &&
                !status.toLowerCase().includes("restarting");

            let entry = { name, status };

            if (isRunning) running.push(entry);
            else stopped.push(entry);
        });

        return { running, stopped };
    }

    _hash(state) {
        return JSON.stringify(state);
    }

    // -------------------------
    // ICON LOGIC
    // -------------------------

    _getIconPath(state) {
        let base =
            GLib.get_home_dir() +
            "/.local/share/cinnamon/applets/docker-simple-panel@ozh/icons/";

        if (state.stopped.length > 0) {
            return base + "docker-red.svg";
        }

        if (state.running.length > 0) {
            return base + "docker.svg";
        }

        return base + "docker-white.svg";
    }

    // -------------------------
    // REFRESH UI
    // -------------------------

    _refresh(force = false) {
        let state = this._lastState;
        let hash = this._hash(state);

        if (!force && hash === this._lastStateHash) return;
        this._lastStateHash = hash;

        let runningCount = state.running.length;
        let hasError = state.stopped.length > 0;

        this.set_applet_label(runningCount.toString());

        // 🐳 KEEP YOUR SVG ICONS EXACTLY AS BEFORE
        this.set_applet_icon_path(this._getIconPath(state));

        if (this._applet_label) {
            let color =
                runningCount === 0
                    ? "#666"
                    : hasError
                    ? "#e67e22"
                    : "#2ecc71";

            this._applet_label.set_style(`
                background-color: ${color};
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-weight: bold;
            `);
        }

        this.set_applet_tooltip(
            `${runningCount} running / ${state.stopped.length} stopped`
        );
    }

    // -------------------------
    // INITIAL SYNC
    // -------------------------

    _syncState() {
        this._lastState = this._getState();
        this._refresh(true);
    }

    // -------------------------
    // DOCKER EVENTS
    // -------------------------

    _startEvents() {
        try {
            let proc = new Gio.Subprocess({
                argv: ["docker", "events", "--format", "{{json .}}"],
                flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            });

            proc.init(null, null);

            let stream = new Gio.DataInputStream({
                base_stream: proc.get_stdout_pipe()
            });

            const readLine = () => {
                stream.read_line_async(
                    GLib.PRIORITY_DEFAULT,
                    null,
                    (s, res) => {
                        try {
                            let [line] = s.read_line_finish_utf8(res);

                            if (line) {
                                this._syncState(); // full resync on event
                            }

                            readLine();
                        } catch (e) {
                            global.logError(e);
                        }
                    }
                );
            };

            readLine();
        } catch (e) {
            global.logError(e);
        }
    }

    // -------------------------
    // MENU
    // -------------------------

    _formatContainer(c) {
        return `${c.name} — ${c.status}`;
    }

    _openLogs(name) {
        GLib.spawn_command_line_async(
            `xfce4-terminal --hold -e "bash -c 'docker logs -f ${name}; exec bash'"`
        );
    }

    _rebuildMenu() {
        this.menu.removeAll();

        let s = this._lastState || { running: [], stopped: [] };

        let mkSection = (title) => {
            let item = new PopupMenu.PopupMenuItem(title);
            item.setSensitive(false);
            this.menu.addMenuItem(item);
        };

        mkSection("🐳 Running");

        if (s.running.length === 0) {
            let empty = new PopupMenu.PopupMenuItem("None");
            empty.setSensitive(false);
            this.menu.addMenuItem(empty);
        } else {
            s.running.forEach(c => {
                let item = new PopupMenu.PopupMenuItem(this._formatContainer(c));
                item.connect("activate", () => this._openLogs(c.name));
                this.menu.addMenuItem(item);
            });
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        mkSection("⛔ Stopped");

        if (s.stopped.length === 0) {
            let empty = new PopupMenu.PopupMenuItem("None");
            empty.setSensitive(false);
            this.menu.addMenuItem(empty);
        } else {
            s.stopped.forEach(c => {
                let item = new PopupMenu.PopupMenuItem(this._formatContainer(c));
                item.connect("activate", () => this._openLogs(c.name));
                this.menu.addMenuItem(item);
            });
        }
    }

    on_applet_clicked() {
        this.menu.toggle();
    }

    on_applet_button_press() {
        this.menu.toggle();
        return true;
    }

    on_applet_removed_from_panel() {
        if (this._proc) {
            try { this._proc.force_exit(); } catch (e) {}
        }
    }
}

function main(metadata, orientation, panelHeight, instanceId) {
    return new DockerApplet(metadata, orientation, panelHeight, instanceId);
}

