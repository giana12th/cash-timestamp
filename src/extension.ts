import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_SECTION = 'timestampViewer';
const CONFIG_KEY_FILE_PATH = 'filePath';
const ICON_PREFIX = '⏱ ';
const DISPLAY_ERROR = '⏱ --:--:--';
const DEBOUNCE_MS = 200;
const INTERVAL_MS = 1000;

/**
 * 秒数を HH:MM:SS 形式に変換する。
 */
function formatElapsed(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/**
 * デバウンス処理を行う関数を返す。
 */
function debounce(fn: () => void, delay: number): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return () => {
        if (timer !== undefined) { clearTimeout(timer); }
        timer = setTimeout(fn, delay);
    };
}

/**
 * タイムスタンプファイルを監視し、経過時間をステータスバーに表示するクラス。
 */
class TimestampWatcher {
    private readonly statusBar: vscode.StatusBarItem;
    private baseTime: Date | null = null;
    private intervalId: ReturnType<typeof setInterval> | undefined;
    private fsWatcher: fs.FSWatcher | undefined;
    private readonly debouncedReload: () => void;
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBar.show();
        this.debouncedReload = debounce(() => this.reloadFile(), DEBOUNCE_MS);
        this.reloadFile();
        this.startFsWatch();
        this.intervalId = setInterval(() => this.updateDisplay(), INTERVAL_MS);
    }

    /** タイムスタンプファイルを読み込み baseTime を更新する。 */
    private reloadFile(): void {
        if (!this.filePath) {
            this.baseTime = null;
            this.updateDisplay();
            return;
        }
        try {
            const raw = fs.readFileSync(this.filePath, 'utf-8').trim();
            const parsed = new Date(raw);
            this.baseTime = isNaN(parsed.getTime()) ? null : parsed;
        } catch {
            this.baseTime = null;
        }
        this.updateDisplay();
    }

    /** ステータスバーの表示テキストを更新する。 */
    private updateDisplay(): void {
        if (this.baseTime === null) {
            this.statusBar.text = DISPLAY_ERROR;
            return;
        }
        const elapsed = (Date.now() - this.baseTime.getTime()) / 1000;
        this.statusBar.text = ICON_PREFIX + formatElapsed(elapsed);
    }

    /**
     * fs.watch でディレクトリを監視する。
     * Windowsでは直接ファイルより親ディレクトリを監視してファイル名フィルタする方が信頼性が高い。
     */
    private startFsWatch(): void {
        this.stopFsWatch();
        if (!this.filePath) { return; }
        const dir = path.dirname(this.filePath);
        const targetFileName = path.basename(this.filePath);
        try { fs.accessSync(dir, fs.constants.R_OK); } catch { return; }
        try {
            this.fsWatcher = fs.watch(dir, (_event, filename) => {
                if (filename === targetFileName) { this.debouncedReload(); }
            });
            this.fsWatcher.on('error', () => this.stopFsWatch());
        } catch { /* ディレクトリ消滅等は無視 */ }
    }

    private stopFsWatch(): void {
        if (this.fsWatcher !== undefined) {
            try { this.fsWatcher.close(); } catch { /* ignore */ }
            this.fsWatcher = undefined;
        }
    }

    /** 設定変更時に新しいファイルパスで監視を再起動する。 */
    public updateFilePath(newFilePath: string): void {
        this.filePath = newFilePath;
        this.reloadFile();
        this.startFsWatch();
    }

    /** 全リソースを解放する。 */
    public dispose(): void {
        if (this.intervalId !== undefined) { clearInterval(this.intervalId); this.intervalId = undefined; }
        this.stopFsWatch();
        this.statusBar.dispose();
    }
}

let watcher: TimestampWatcher | undefined;

function getConfiguredFilePath(): string {
    return vscode.workspace.getConfiguration(CONFIG_SECTION).get<string>(CONFIG_KEY_FILE_PATH, '');
}

/**
 * 拡張機能のアクティベーション関数。
 */
export function activate(context: vscode.ExtensionContext): void {
    watcher = new TimestampWatcher(getConfiguredFilePath());
    const configListener = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration(`${CONFIG_SECTION}.${CONFIG_KEY_FILE_PATH}`)) {
            watcher?.updateFilePath(getConfiguredFilePath());
        }
    });
    context.subscriptions.push(configListener, { dispose: () => watcher?.dispose() });
}

/**
 * 拡張機能の非アクティベーション関数。
 */
export function deactivate(): void {
    watcher?.dispose();
    watcher = undefined;
}
