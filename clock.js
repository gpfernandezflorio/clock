/**

  @CLOCK: Usa la función setInterval para generar pulsos periódicamente.
    Una vez asignada su frecuencia en milisegundos (INTERVALO_INICIAL) se puede
    modificar la velocidad con un multiplicador (indicador). Para evitar errores
    de redondeo se usa siempre un entero como indicador y se mantiene una relación
    (ESCALA) que permite traducir entre los valores reales y los usados internamente.
    Al crearlo se define la granularidad como la cantidad de dígitos decimales que
    se van a considerar como multiplicadores válidos. Con granularidad cero sólo
    se puede multiplicar la velocidad por un número entero. Con granularidad 1 el
    multiplicador de velocidad puede tener hasta un dígito decimal y el indicador
    se interpreta como el multiplicador multiplicado por 10 (para que siempre sea
    un número entero). También se puede asignar la velocidad usando un objeto que
    tenga como atributos "int" y "dec" representando las partes entera y decimal,
    respectivamente. Entonces, para setear la velocidad en 1.5 (siempre que la
    granularidad sea mayor o igual a 1) se le puede pasar como argumento el objeto
    con campo "int" igual a 1 y el campo "dec" igual a 5.

  @_Atributos_

  // ESCALA @entero multiplicador para convertir entre la escala real y la usada en el clock.
    Se configura al crear el clock con CLOCK.crear.
  // INTERVALO_INICIAL @entero cantidad de milisegundos que dura un pulso en velocidad
    estandar (es decir, velocidad = 10). Se configura al crear el clock con CLOCK.crear.
  // MINIMO_INTERVALO @entero cantidad de milisegundos mínima permitida por el sistema.
    por defecto es 10ms porque es lo mínimo que permite el setInterval pero podría ser
    mayor si el sistema es muy lento. Se configura al crear el clock con CLOCK.crear.
  // velocidad @registro representa la velocidad del clock a partir de:
    // N @entero Indicador de velocidad actual (pensado para valer 1 en velocidad
      "normal", 2 en velocidad "doble" o 0.5 en velocidad "media").
      SIN EMBARGO: Para mantener este campo como un entero y a la vez permitir
      velocidades entre 0 y 1, almaceno el valor real multiplicado por 10.
    // intervalo @entero cantidad de milisegundos del intervalo actual para
      lograr la velocidad en el campo N. Al aumentar la velocidad, este número
      debería disminuir en la misma proporción. SIN EMBARGO: Puede llegar a un
      mínimo establecido por una restricción del sistema (o de la función
      setInterval que es 10ms) así que para poder seguir aumentando la velocidad
      más allá se aumenta la cantidad de pulsos emitidos por tick.
    // pulsosPorTick @entero Cantidad de pulsos emitidos en cada tick del clock.
      Se intenta mantener en 1 mientras sea posible, modificando el valor del
      campo "intervalo" pero cuando llega a un mínimo pulsosPorTick empieza a
      aumentar para simular el mismo comportamiento.
  // intervalo @entero Id del intervalo que se está ejecutando con setInterval,
    si es que el clock está corriendo. Se asigna al iniciar el clock y se elimina
    al detenerlo.
  // funcion @funcion La función que se va a ejecutar en cada pulso. Se asigna
    al iniciar el clock y se elimina al detenerlo.

  @_Funciones_

  // crear @entero_entero_void Crear un nuevo clock y configurar todos los valores
    iniciales. Ninguna otra función se puede ejecutar antes que esta.
  // iniciar @funcion_void Poner a correr el clock. Si ya estaba corriendo, no hace nada.
  // detener @void Detener el clock. Si no estaba corriendo, no hace nada.
  // setearVelocidad @entero_void Establece una nueva velocidad para el clock a
    partir del indicador deseado. Se puede ejecutar aunque el clock esté corriendo.
  // tick @void La función que se ejecuta en cada llamado del intervalo. Genera los pulsos.

**/

CLOCK = { };

/**@crear
  // intervaloInicial @entero valor para asignarle a CLOCK.INTERVALO_INICIAL
  // minimoIntervalo @entero valor para asignarle a CLOCK.MINIMO_INTERVALO
  // granularidad @entero cantidad de dígitos decimales permitidos. Se usa
    para asignar el valor de CLOCK.ESCALA (10 ^ granularidad).
**/
CLOCK.crear = function(intervaloInicial, minimoIntervalo=10, granularidad=1) {
    CLOCK.INTERVALO_INICIAL = intervaloInicial;
    CLOCK.MINIMO_INTERVALO = minimoIntervalo;
    CLOCK.ESCALA = Math.pow(10, granularidad);
    CLOCK.setearVelocidad(CLOCK.ESCALA);
};

/**@iniciar
  // funcion @funcion La función que se va a ejecutar en cada pulso.
**/
CLOCK.iniciar = function(funcion) {
  if (CLOCK.intervalo === undefined) {
    CLOCK.funcion = funcion;
    CLOCK.intervalo = setInterval(CLOCK.tick, CLOCK.velocidad.intervalo);
  }
};

/**@detener**/
CLOCK.detener = function() {
  if (CLOCK.intervalo !== undefined) {
    clearInterval(CLOCK.intervalo);
    delete CLOCK.funcion;
    delete CLOCK.intervalo;
  }
};

/**@setearVelocidad
  // indicador @entero El indicador de la nueva velocidad a establecer.
    Ejemplos:
      - Con granularidad 0 el indicador es igual al multiplicador así que para
      que el clock se ejecute al doble de la velocidad inicial se le debe pasar 2.
      - Con granularidad 1 el indicador debe ser el multiplicador deseado multiplicado
      por 10 así que para ejecutar a la mitad de la velocidad inicial se le debe pasar 5
      y para volver a la velocidad inicial se le debe pasar 10.
    También se le puede pasar un objeto con los campos 'int' y 'dec' representando
      un número decimal. Este formato es independiente de la granularidad pero la
      cantidad de dígitos tomados de la parte decimal dependerá de ella.
**/
CLOCK.setearVelocidad = function(indicador) {
  if (typeof(indicador)=='object') {
    let parteEntera = indicador.int || 0;
    let parteDecimal = indicador.dec || 0;
    while (parteDecimal > CLOCK.ESCALA) {
      parteDecimal /= 10;
    }
    indicador = parteEntera * CLOCK.ESCALA + Math.floor(parteDecimal);
  }

  // Para no arrastrar errores de redondeo, en lugar de empezar desde el indicador
    // actual, vuelvo a empezar desde el indicador inicial.
  let intervalo = Math.floor(CLOCK.INTERVALO_INICIAL * CLOCK.ESCALA / indicador);
  let pulsosPorTick = 1;

  // Si el intervalo inicial es menor al mínimo, ejecuto varios pulsos para
    // simular el mismo comportamiento
  if (intervalo < CLOCK.MINIMO_INTERVALO) {
    pulsosPorTick = Math.floor(CLOCK.MINIMO_INTERVALO / intervalo);
    intervalo = CLOCK.MINIMO_INTERVALO;
    // Pero eso podría dejarme demasiado lejos de la cantidad deseada de pulsos
      // por segundo (basándome en el indicador y el intervalo inicial)
    let pulsosPorSegundo = (indicador*1000/CLOCK.ESCALA)/CLOCK.INTERVALO_INICIAL;
    let diferencia = Math.abs(pulsosPorTick*1000/intervalo - pulsosPorSegundo);
    let otroIntento = function(i, ppt) {
      let intento = {
        intervalo: i,
        pulsosPorTick: ppt
      }
      intento.pulsosPorTick++;
      intento.intervalo = Math.ceil(intento.pulsosPorTick*1000/pulsosPorSegundo);
      return intento;
    };
    while (diferencia > 0.1*pulsosPorSegundo) {
      // Es preferible subir un poco el intervalo sacrificando un poco el
        // framerate para obtener mayor precisión
      let intento = otroIntento(intervalo, pulsosPorTick);
      if (intervalo.intento < CLOCK.MINIMO_INTERVALO) { break; }
      intervalo = intento.intervalo;
      pulsosPorTick = intento.pulsosPorTick;
      diferencia = Math.abs(intento.pulsosPorTick*1000/intento.intervalo - pulsosPorSegundo);
    }
  }
  CLOCK.velocidad = {
    N: indicador,
    intervalo: intervalo,
    pulsosPorTick: pulsosPorTick
  };

  // Si estaba corriendo, actualizo el intervalo
  if (CLOCK.intervalo !== undefined) {
    clearInterval(CLOCK.intervalo);
    CLOCK.intervalo = setInterval(CLOCK.tick, CLOCK.velocidad.intervalo);
  }
};

/**@tick**/
CLOCK.tick = function() {
  for (let pulso = 0; pulso < CLOCK.velocidad.pulsosPorTick; pulso++) {
    if ('funcion' in CLOCK) { CLOCK.funcion(); }
  }
};
