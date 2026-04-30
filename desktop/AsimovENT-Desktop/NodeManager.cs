using System;
using System.Diagnostics;
using System.IO;
using System.Windows;

namespace AsimovENT
{
    /// <summary>
    /// Singleton responsable du cycle de vie du processus Node.js (server.js).
    /// Lance le serveur au démarrage de l'application et l'arrête proprement à la fermeture.
    /// </summary>
    public class NodeManager
    {
        // ─── Singleton ────────────────────────────────────────────────────────
        private static readonly Lazy<NodeManager> _instance =
            new Lazy<NodeManager>(() => new NodeManager());
        public static NodeManager Instance => _instance.Value;

        // ─── État ─────────────────────────────────────────────────────────────
        private Process? _nodeProcess;
        private bool _running = false;

        private NodeManager() { }

        // ─── Démarrage ────────────────────────────────────────────────────────
        /// <summary>
        /// Lance node server.js depuis le dossier api/ à côté de l'exécutable.
        /// </summary>
        /// <returns>true si le processus a démarré, false sinon.</returns>
        public bool Start()
        {
            if (_running) return true;

            // Chemin vers api/server.js (relatif à l'exe)
            string exeDir = AppContext.BaseDirectory;
            string apiDir = Path.Combine(exeDir, "api");
            string serverJs = Path.Combine(apiDir, "server.js");

            if (!File.Exists(serverJs))
            {
                MessageBox.Show(
                    $"Fichier introuvable : {serverJs}\n\nVérifiez que le dossier api/ est bien présent à côté de l'application.",
                    "AsimovENT — Erreur de configuration",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
                return false;
            }

            try
            {
                var startInfo = new ProcessStartInfo
                {
                    FileName = "node",
                    Arguments = "server.js",
                    WorkingDirectory = apiDir,
                    UseShellExecute = false,
                    CreateNoWindow = true,          // Pas de fenêtre console visible
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                };

                _nodeProcess = new Process { StartInfo = startInfo };

                // Log stdout/stderr dans un fichier pour debug
                string logPath = Path.Combine(exeDir, "asimov-api.log");
                _nodeProcess.OutputDataReceived += (s, e) => AppendLog(logPath, e.Data);
                _nodeProcess.ErrorDataReceived += (s, e) => AppendLog(logPath, e.Data);

                _nodeProcess.Start();
                _nodeProcess.BeginOutputReadLine();
                _nodeProcess.BeginErrorReadLine();

                _running = true;
                return true;
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Impossible de lancer Node.js :\n{ex.Message}\n\nVérifiez que Node.js est installé (https://nodejs.org).",
                    "AsimovENT — Erreur",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error
                );
                return false;
            }
        }

        // ─── Arrêt ────────────────────────────────────────────────────────────
        /// <summary>
        /// Arrête proprement le processus Node.js.
        /// </summary>
        public void Stop()
        {
            if (!_running || _nodeProcess == null) return;

            try
            {
                if (!_nodeProcess.HasExited)
                {
                    _nodeProcess.Kill(entireProcessTree: true);
                    _nodeProcess.WaitForExit(3000);
                }
            }
            catch { /* Le processus était déjà mort */ }
            finally
            {
                _nodeProcess.Dispose();
                _nodeProcess = null;
                _running = false;
            }
        }

        // ─── Log ──────────────────────────────────────────────────────────────
        private static void AppendLog(string path, string? line)
        {
            if (string.IsNullOrEmpty(line)) return;
            try
            {
                File.AppendAllText(path, $"[{DateTime.Now:HH:mm:ss}] {line}{Environment.NewLine}");
            }
            catch { /* Ignore les erreurs d'écriture */ }
        }
    }
}