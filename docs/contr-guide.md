# Guia de contribución #
[En desarrollo]

Este documento describe la forma de trabajo para todos los desarrolladores que estén contribuyendo al proyecto __Concepción Transparente__.

El proyecto cuenta con un [board](https://github.com/DatosConcepcionDelUruguay/Concepcion-transparente/projects/1) en el cual aparecen todas las tareas pendientes, en progreso y terminadas.

## Flow para nuevas funcionalidades / bugs ##
1. Al tomar una tarea, el desarrollador crea un branch con el nombre `feature/#<Id of the issue>`, para nueva funcionalidades, o `bug/X<Id of the issue>` para bugs, a partir del branch `develop`. La tarea pasa a `In progress`.

1. Al terminar la funcionalidad, el branch creado por el desarrollador se mergea a `develop`, lo cual dispara el deploy automático al ambiente de pruebas.

1. Al verificar la funcionalidad en el ambiente de pruebas por parte del desarrolador la tarea pasa a `To Test`.

1. Una vez verificada en sus conjunto, la tarea pasa a `Tested`.

## Flow para el deploy a producción ##

1. Cuando se decida promover un conjunto de cambios a `producción`, se procede a mergear `develop` a `master`.

1. Se crea un PR de `develop` a `master`.

1. Se revisa el PR y se procede a mergearlo.

1. El commit a master dispara el build/deploy automático y a producción.

## Flow para hotfixes ##
TBC

## Notas sobre PRs ##
Al ser un equipo chico y donde los desarrolladores no siempre van a estar disponibles para revisar PRs, `develop` acepta commits directos.

