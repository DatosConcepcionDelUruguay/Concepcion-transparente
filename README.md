| Branch  | Status   |
| ------- | :------: |
| develop | [![Build Status](https://travis-ci.org/DatosConcepcionDelUruguay/Concepcion-transparente.svg?branch=develop)](https://travis-ci.org/DatosConcepcionDelUruguay/Concepcion-transparente) |
| master  | [![Build Status](https://travis-ci.org/DatosConcepcionDelUruguay/Concepcion-transparente.svg?branch=master)](https://travis-ci.org/DatosConcepcionDelUruguay/Concepcion-transparente) |

# Concepción-transparente
Portal de Transparencia de la ciudad de Concepción del Uruguay (Entre Ríos, Argentina). Este sitio web refleja de manera fácil y comprensible el detalle de gastos, compras, proveedores, contrataciones y otras modalidades a partir de la información oficial que publica la Municipalidad de Concepción del Uruguay. 


## Ejecutar en local

1. Hacer checkout del branch sobre el cual quiere trabajar: __`git checkout <branch>`__
1. Ejecuta __`npm install`__ en el directorio del proyecto.
1. El ambiente local debe contar con una instalación de MongoDB.
1. Crea un archivo .env con la siguiente variable: __`CONNECTION_STRING=<connection string al MongoDB local>`__
1. Si no hay datos previamente cargados, hay que forzar la ejecución del scrapper (tenemos que mejorar ésta parte).
1. __`npm start`__
1. Ingresar a __localhost:3000__ en un browser.

## Guía para contribuir al proyecto ##
[Ver guía](docs/contr-guide.md)
