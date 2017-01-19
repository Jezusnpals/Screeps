@echo off
set jsDir= C:\Projects\screeps\Screeps\ScreepsWithDocumentation\ScreepsWebsite\js
set steamDefaultDir= C:\Users\Jake\AppData\Local\Screeps\scripts\127_0_0_1___21025\default
cd %jsDir%

setlocal EnableDelayedExpansion
set i = 0
for /r %%f in (*) do (
	set /A i+=1
	set array[!i!]=%%f
)
set n=%i%

for /L %%i in (1,1,%n%) do (
	xcopy /Y !array[%%i]! %steamDefaultDir%
)
@echo on
echo File Transfer Complete