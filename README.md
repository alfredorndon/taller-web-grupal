# taller-web-grupal
Juego de Batalla Naval, hecho por Jharold Panza, Oscar Manrique y Alfredo Rondón para Programación Orientada a la Web, semestre sept. 2024 - enero 2025.

El servidor se encuentra desplegado en Railway, usando node.js para su implementación, por esta misma razón, no es necesario más nada que iniciar la aplicación con conexión a internet(cuidado con los firewalls, si hay alguno puede interrumpir la conexion), el archivo que debe abrirse es el inicio.html y el servidor con toda su configuración se encuentra en la carpeta server.

Apenas se inicia el juego, saldrá una pagina principal con las instrucciones y la colocación del nombre; inmediatamente despues de colocar su nombre de usuario, puede seleccionar algín modo de juego, la colocacion de los barcos y los ataques funcionan mediante clicks, y los power-ups disponibles se activan a través de botones para luego ser comprados durante su turno correspondiente.

El archivo railway.toml es unicamente configurativo para el despliegue en railway, no tiene incidencia real en la ejecucion del juego.

Para la última entrega desarrollamos la totalidad de todos los modos de juego: dos jugadores, tres jugadores, cuatro jugadores y modo torneo (de máximo 8 jugadores). Nuestro modo torneo se desarrolla en una partida de 8 jugadores en simultáneo, como un Battle Royale, donde ganará la persona que tenga mas "hits" acertados a los barcos, los cuales se suman en forma de puntaje de forma interna para ser mostrados al final del torneo, mientras que cada jugador que vaya perdiendo entrará en un modo de expectador hasta el final de la partida. En cuanto a los power-ups, sólo están implementados el Sonar, la Mina Marina y el Ataque EMP. Sin embargo, esta es la lógica que sería utilizada para la implementación de los power-ups:

---------------- Aviones de Ataque ----------------

Disponible si el portaaviones del jugador no ha sido hundido. Se añade un case en comprarPowerUp. Se verifica si el portaaviones existe en barcos y si no está hundido. Costo: 10 puntos. Se generan hasta 5 coordenadas aleatorias dentro del tablero enemigo. Se envia un mensaje al servidor con las coordenadas attack-planes con la lista de casillas. El servidor procesa el ataque, enviando un mensaje a todos los jugadores con los resultados de cada misil (hit/miss) attack-planes-result. Se actualizan los tableros de los jugadores.

```
case 'Aviones de Ataque ✈️ - 10 puntos':
    if (puntaje >= 10 && barcos.some(barco => barco.tipo === 'portaaviones' && !barco.hundido)) {
        puntaje -= 10;
        // Generar coordenadas aleatorias y envia un mensaje al servidor para actualizar los tableros de los oponentes
        let coordenadas = [];
        for (let i = 0; i < 5; i++) {
            let letra = abecedario[randomizador(1, 10)];
            let numero = randomizador(1, 10);
            coordenadas.push("p"+(jugadoresJuego.indexOf(localStorage.getItem('nombreJugador'))+1)+"-"+letra + numero);
        }
        ws.send(JSON.stringify({ type: 'attack-planes', gameId: localStorage.getItem('partidaActiva'), coordenadas: coordenadas, jugadorAtacado:jugadorAtacado }));
    } else {
        alert('No tienes puntos suficientes o tu portaaviones ha sido hundido.');
    }
    break;
```

---------------- Escudo Defensivo ----------------

Se añade un case en comprarPowerUp. Se verifica si ya se ha usado el escudo en la partida (se podría usar una variable escudoUsado para esto). Costo: 15 puntos. Un solo uso por partida y dura 3 turnos. Se guarda la información del escudo activo (jugador y duración) en una variable. Se envia un mensaje al servidor defensive-shield-activate.
Cuando un jugador con el escudo activo es atacado, el servidor verifica el area de 3x3 que protege, si coincide con el ataque, envia un mensaje defensive-shield-block a ambos jugadores. Se implementa un contador de turnos para la duración del escudo.

Sin embargo, también haría falta una funcion auxiliar para calcular el área 3x3 del escudo dentro del tablero.

```
function calcularArea(casillaCentralId) {
    let letraCentral = casillaCentralId.charAt(3);
    let numeroCentral = parseInt(casillaCentralId.charAt(4));
    let area = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let nuevaLetra = String.fromCharCode(letraCentral.charCodeAt(0) + i);
            let nuevoNumero = numeroCentral + j;
            if (nuevoNumero >= 1 && nuevoNumero <= 10 && nuevaLetra.charCodeAt(0) >= 'A'.charCodeAt(0) && nuevaLetra.charCodeAt(0) <= 'J'.charCodeAt(0)) {
                area.push('p'+(jugadoresJuego.indexOf(localStorage.getItem('nombreJugador'))+1)+'-'+nuevaLetra + nuevoNumero);
            }
        }
    }
    return area;
}

case 'Escudo Defensivo ️ - 15 puntos':
    if (puntaje >= 15 && !escudoUsado) {
        puntaje -= 15;
        let tableroJugador = document.getElementById(localStorage.getItem('nombreJugador'));
        let tablero = tableroJugador.querySelector('.tablero');
        let jugadorActual = jugadoresJuego.indexOf(localStorage.getItem('nombreJugador')) + 1;
        function handleTableroClick(event) {
            let casillaCentralId = event.target.id;
            if(!casillaCentralId.includes("p"+jugadorActual)) return;
            if (casillaCentralId && event.target.classList.contains('table-cell')) {
                let areaEscudo = calcularArea(casillaCentralId, jugadorActual); // Llamada a la función externa
                console.log("Area del escudo:", areaEscudo);
                ws.send(JSON.stringify({
                    type: 'defensive-shield-activate',
                    gameId: localStorage.getItem('partidaActiva'),
                    playerName: localStorage.getItem('nombreJugador'),
                    casillaCentral: casillaCentralId,
                    areaProtegida: areaEscudo
                }));
                areaEscudo.forEach(id => {
                    let casilla = document.getElementById(id);
                    if (casilla) casilla.classList.add('escudo-activo');
                });
                tablero.removeEventListener('click', handleTableroClick);
                escudoUsado = true;
            }
            else
            {
                alert("Debes seleccionar una casilla de tu tablero")
            }
        }
        tablero.addEventListener('click', handleTableroClick);
        alert('Selecciona la casilla central para activar el Escudo Defensivo.');
    } else {
        alert('No tienes puntos suficientes o ya has usado el escudo.');
    }
    break;
```

---------------- Misil Crucero ----------------

Se añade un case en comprarPowerUp. Se verifica el tiempo de recarga. Costo: 15 puntos. Tiempo de recarga: 5 turnos. Inmediata al seleccionar el power-up y luego la casilla central del área de ataque. El jugador selecciona el Misil Crucero y luego una casilla en el tablero enemigo, se envía un mensaje al servidor (cruise-missile) con la casilla central. El servidor calcula las 9 casillas afectadas y envía un mensaje a todos los jugadores con las casillas atacadas y los resultados (hit/miss) cruise-missile-result. Se actualizan los tableros y se inicia el tiempo de recarga.

Se implementa la misma función utilizada en el power-up Escudo Defensivo para calcular el área 3x3 donde se va a realizar el ataque de Misil Crucero.

```
case 'Misil Crucero  - 15 puntos':
    if (puntaje >= 15 && misilCruceroCooldown <= 0) {
        puntaje -= 15;
        let tablerosEnemigos= document.querySelectorAll('.tablero-juego');
        let jugadorAtacado;
        let tableroEnemigo;
        tablerosEnemigos.forEach(tablero=>{
            if(tablero.id!=localStorage.getItem('nombreJugador'))
            {
                tableroEnemigo=tablero.querySelector('.tablero');
                jugadorAtacado=tablero.id;
            }
        })
        function handleTableroClickEnemigo(event) {
            let casillaCentralId = event.target.id;
            if(!casillaCentralId.includes("p")) return;
            if(casillaCentralId && event.target.classList.contains('table-cell'))
            {
                let areaAtaque = calcularArea(casillaCentralId,jugadorAtacado);
                console.log("Área de ataque del misil:", areaAtaque);
                ws.send(JSON.stringify({ type: 'cruise-missile', gameId: localStorage.getItem('partidaActiva'), playerName: localStorage.getItem('nombreJugador'), casillaCentral: casillaCentralId, jugadorAtacado:jugadorAtacado, areaAtaque:areaAtaque }));
                tableroEnemigo.removeEventListener('click', handleTableroClickEnemigo);
                misilCruceroCooldown = 5;
            }
            else
                alert("Debes seleccionar una casilla del tablero enemigo")
        }
        tableroEnemigo.addEventListener('click', handleTableroClickEnemigo);
        alert('Selecciona la casilla central para el ataque del Misil Crucero.');
    } else {
        alert('No tienes puntos suficientes o el misil está en recarga.');
    }
    break;
```

---------------- Reparación Rápida ----------------

Se añade un case en comprarPowerUp. Se verifica si el barco seleccionado ya ha sido reparado. Costo: 10 puntos. Un solo uso por barco. Se pide al jugador que seleccione un barco propio que tenga al menos una parte dañada. Se busca en el array barcos la información del barco seleccionado. Se reparan hasta 2 casillas y se envia un mensaje al servidor fast-repair-result con las casillas reparadas. Se actualiza el tablero y se marca el barco como reparado.

```
case 'Reparación Rápida ️ - 10 puntos':
    if (puntaje >= 10) {
        // Pedir al jugador que seleccione un barco
        let barcoSeleccionado = prompt("Selecciona el tipo de barco a reparar (portaaviones, acorazado, etc.):");
        if (barcoSeleccionado && barcos.some(barco => barco.tipo === barcoSeleccionado && barco.reparado === false)) {
            puntaje -= 10;
            // Lógica para reparar hasta 2 casillas y enviar mensaje al servidor
            ws.send(JSON.stringify({ type: 'fast-repair', gameId: localStorage.getItem('partidaActiva'), barco: barcoSeleccionado, jugadorAtacado:jugadorAtacado}));
        }
        else
        {
            alert('No tienes barcos que reparar o ya has reparado este barco.');
        }
    } else {
        alert('No tienes puntos suficientes.');
    }
    break;
```