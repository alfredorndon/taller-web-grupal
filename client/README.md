# taller-web-grupal
Juego de Batalla Naval, hecho por Jharold Panza, Oscar Manrique y Alfredo Rondón 
para Programación Orientada a la Web, semestre sept. 2024 - enero 2025.

El servidor se encuentra desplegado en Railway, usando node.js para su implementación,
por esta misma razón, no es necesario más nada que iniciar la aplicación con conexión a internet, el archivo
que debe abrirse es el inicio.html y el servidor con toda su configuración se encuentra en la carpeta server.

Apenas se inicia el juego, saldrá una pagina principal con las instrucciones y la colocación del nombre;
inmediatamente despues de colocar su nombre de usuario, puede seleccionar algín modo de juego, la colocacion de los barcos
y los ataques funcionan mediante clicks, y los power-ups disponibles se activan a través de botones para luego ser
comprados durante su turno correspondiente.

el archivo railway.toml es unicamente configurativo para el despliegue en railway, 
no tiene incidencia real en la ejecucion del juego.


Para la última entrega desarrollamos la totalidad de todos los modos de juego: dos jugadores, tres jugadores,
cuatro jugadores y modo torneo (de máximo 8 jugadores).
En cuanto a los power-ups, sólo están implementados el Sonar, la Mina Marina y el Ataque EMP.

Sin embargo, esta es la lógica que sería utilizada para la implementación de los power-ups:

Consideraciones Generales:


---------------- Aviones de Ataque ----------------



