using System.Windows;

namespace AsimovENT
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
        }

        protected override void OnExit(ExitEventArgs e)
        {
            // S'assure que Node est bien tué à la fermeture de l'app
            NodeManager.Instance.Stop();
            base.OnExit(e);
        }
    }
}