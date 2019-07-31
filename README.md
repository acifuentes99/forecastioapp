# Forecast IO APP

App que utiliza la API de Forecast.io, para mostrar el tiempo y la temperatura de Países.

## Instalación

* Tener instalado los paquetes necesarios, para colocar en producción un servidor NodeJS
* Clonar el repositorio
* Instalar los requerimientos de la aplicación con el comando "npm install"
* Editar el archivo ".env" (siguiendo el archivo .env.ejemplo), y colocar las credenciales de servidor de Redis y de Forecast.io
* Ejecutar el servidor, escribiendo "npm start" en consola

Posteriormente, acceder al sitio del proyecto para observar su funcionamiento.

## Deploy en Heroku

Se prueba esta aplicación en Heroku, y los pasos son muy similares a los anteriores, con algunas modificaciones:

* Crear una aplicación en Heroku
* En Resources, agregar el Add On de "Heroku Redis"
* Ir a pestaña Deploy. Utilizar el Git de Heroku a través del CLI, o utilizar GitHub para poder enlazar el repositorio. (En este caso, se realizó enlazando con repositorio GitHub).
* Ir a la opción de "Manual Deploy" en las opciones. Seleccionar la rama con la cual quiere clonarse el repositorio (por lo general, Master).
* Apretar el botón "Deploy Branch". Esto hará todo el proceso de instalación del repositorio dentro de Heroku. Heroku señalará que la App de encuentra lista para ser vista.
* Todavía falta modificar las variables de entorno. Ir a pestaña Settings
* Ir a opción de "Config Vars", apretar "Reveal Config Vars". Esto mostrará las variables de entorno que Heroku asigna a la aplicación. Redis viene predeterminado, pero faltaría agregar las siguientes:
	* SERVER_PORT : 5000 (Puerto original de Heroku)
	* FORECAST_APIKEY : La llave secreta entregada por Forecast.io

Con los pasos anteriores, al modificar las variables de entorno, se reinicia el servidor. Con esto, la aplicación queda lista para su uso.
