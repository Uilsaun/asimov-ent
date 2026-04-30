using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media.Animation;
using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.Core;

namespace AsimovENT
{
    public partial class MainWindow : Window
    {
        // URL de l'ENT (servie par Node localement)
        private const string EntUrl = "http://localhost:3000";
        private const string HealthUrl = "http://localhost:3000/api/health";

        private readonly HttpClient _http = new HttpClient { Timeout = TimeSpan.FromSeconds(2) };

        public MainWindow()
        {
            InitializeComponent();

            // Icône : aucune
            this.Icon = null;

            // Titlebar bleu foncé (Windows 11)
            SourceInitialized += (s, e) =>
            {
                var hwnd = new System.Windows.Interop.WindowInteropHelper(this).Handle;
                int color = 0x004A1E0C; // BGR de #0C1E4A
                DwmSetWindowAttribute(hwnd, 35, ref color, sizeof(int));
            };

            Loaded += OnLoaded;
            Closing += OnClosing;
        }

        // ─── Démarrage ────────────────────────────────────────────────────────
        private async void OnLoaded(object sender, RoutedEventArgs e)
        {
            try
            {
                // 1. Initialiser WebView2
                SetStatus("Initialisation du navigateur...", 10);
                await InitWebView();

                // 2. Lancer Node.js
                SetStatus("Démarrage du serveur local...", 30);
                bool nodeStarted = NodeManager.Instance.Start();
                if (!nodeStarted)
                {
                    ShowError("Impossible de démarrer Node.js.\nVérifiez que Node.js est installé sur cette machine.");
                    return;
                }

                // 3. Attendre que l'API réponde
                SetStatus("Connexion à l'API...", 55);
                bool apiReady = await WaitForApi(timeoutSeconds: 20);
                if (!apiReady)
                {
                    ShowError("L'API ne répond pas après 20 secondes.\nConsultez les logs dans le dossier de l'application.");
                    return;
                }

                // 4. Charger l'ENT
                SetStatus("Chargement de l'ENT...", 80);
                WebView.Source = new Uri(EntUrl);
                await Task.Delay(800); // Laisse le temps au WebView de commencer à charger

                // 5. Afficher
                SetStatus("Prêt !", 100);
                await Task.Delay(300);
                ShowWebView();
            }
            catch (Exception ex)
            {
                ShowError($"Erreur inattendue :\n{ex.Message}");
            }
        }

        // ─── Initialisation WebView2 ──────────────────────────────────────────
        private async Task InitWebView()
        {
            // Dossier de données utilisateur pour WebView2
            string userDataDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "AsimovENT", "WebView2"
            );
            Directory.CreateDirectory(userDataDir);

            var env = await CoreWebView2Environment.CreateAsync(null, userDataDir);
            await WebView.EnsureCoreWebView2Async(env);

            // Désactiver la barre de contexte par défaut pour une app native propre
            WebView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            WebView.CoreWebView2.Settings.AreDevToolsEnabled = false; // Mettre true en dev
            WebView.CoreWebView2.Settings.IsStatusBarEnabled = false;

            // Titre de la fenêtre dynamique selon la page
            WebView.CoreWebView2.DocumentTitleChanged += (s, e) =>
            {
                Dispatcher.Invoke(() => Title = WebView.CoreWebView2.DocumentTitle);
            };
        }

        // ─── Attente API ──────────────────────────────────────────────────────
        private async Task<bool> WaitForApi(int timeoutSeconds)
        {
            var deadline = DateTime.Now.AddSeconds(timeoutSeconds);
            int attempt = 0;

            while (DateTime.Now < deadline)
            {
                attempt++;
                try
                {
                    var response = await _http.GetAsync(HealthUrl);
                    if (response.IsSuccessStatusCode)
                        return true;
                }
                catch { /* API pas encore prête, on attend */ }

                // Progression animée pendant l'attente
                double progress = 55 + (attempt / (double)(timeoutSeconds)) * 20;
                SetStatus($"Connexion à l'API... (tentative {attempt})", Math.Min(75, progress));

                await Task.Delay(1000);
            }
            return false;
        }

        // ─── Affichage ────────────────────────────────────────────────────────
        private void ShowWebView()
        {
            SplashScreen.Visibility = Visibility.Collapsed;
            WebView.Visibility = Visibility.Visible;
        }

        private void SetStatus(string message, double progressPercent)
        {
            Dispatcher.Invoke(() =>
            {
                StatusText.Text = message;

                // Anime la barre de progression
                double targetWidth = (progressPercent / 100.0) * 280;
                var anim = new DoubleAnimation(targetWidth, TimeSpan.FromMilliseconds(400));
                ProgressBar.BeginAnimation(WidthProperty, anim);
            });
        }

        private void ShowError(string message)
        {
            Dispatcher.Invoke(() =>
            {
                StatusText.Text = "❌ Erreur";
                StatusText.Foreground = System.Windows.Media.Brushes.Red;
                MessageBox.Show(message, "Erreur — AsimovENT",
                    MessageBoxButton.OK, MessageBoxImage.Error);
                Close();
            });
        }

        // ─── Fermeture ────────────────────────────────────────────────────────
        private void OnClosing(object? sender, System.ComponentModel.CancelEventArgs e)
        {
            NodeManager.Instance.Stop();
        }

        [DllImport("dwmapi.dll")]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int value, int size);
    }
}