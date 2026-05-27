!macro customInstall
  CreateDirectory "$DOCUMENTS\SpiceGarden\logs"
  CreateShortCut "$DESKTOP\SpiceGarden Launcher.lnk" "$INSTDIR\SpiceGarden Launcher.exe"
!macroend