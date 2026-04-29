; ══════════════════════════════════════════════════════════
; AsimovENT-Setup.iss — Script Inno Setup
; Compile avec Inno Setup 6.x pour générer un .exe d'installation
; ══════════════════════════════════════════════════════════

#define MyAppName "ENT Asimov"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Collège Isaac Asimov"
#define MyAppURL "https://college-asimov.fr"
#define MyAppExeName "AsimovENT.exe"
#define DistDir "..\..\dist"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\AsimovENT
DefaultGroupName={#MyAppName}
OutputDir=..\..\dist-setup
OutputBaseFilename=AsimovENT-Setup
SetupIconFile=
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{#DistDir}\AsimovENT.exe";       DestDir: "{app}"; Flags: ignoreversion
Source: "{#DistDir}\WebView2Loader.dll";  DestDir: "{app}"; Flags: ignoreversion
Source: "{#DistDir}\runtimes\*";          DestDir: "{app}\runtimes"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#DistDir}\web\*";               DestDir: "{app}\web";      Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}";                   Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Désinstaller {#MyAppName}";      Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}";             Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
