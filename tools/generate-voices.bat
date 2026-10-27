@echo off
REM Office Wahala: make Nigerian AI voice clips (needs Python and internet)
cd /d "%~dp0.."
where py >nul 2>nul && (set PY=py) || (set PY=python)
%PY% -m pip install --upgrade edge-tts
%PY% tools\generate_voices.py
echo.
echo Finished. Upload the whole office-wahala folder again (including the new voices folder).
pause
