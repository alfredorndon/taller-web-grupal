const abecedario = [' ','A','B','C','D','E','F','G','H','I','J'];
const filas = 10;
const columnas = 10;
const jugadores = 1;

function crearTablero ()
{
    for (let j=1; j<=jugadores; j++)
    {
        let tablero = document.getElementById('tabla-p'+j);
        for (let i=0; i<=columnas; i++)
        {
            let header = document.createElement('div');
            header.setAttribute('class', 'position table-head'+i);
            tablero.appendChild(header);
            let celda = document.createElement('div');
            for (let k=1; k<=filas; j++)
            {
                if (i == 0)
                    {
                        celda.setAttribute('class', 'position table-head'+abecedario[k]+i);
                        tablero.appendChild(celda);
                    }
                celda.setAttribute('class', 'position table-cell');
                celda.setAttribute('id', 'p'+j+'-'+abecedario[k]+i);
                tablero.appendChild(celda);
            }
        }
    }
}

crearTablero();