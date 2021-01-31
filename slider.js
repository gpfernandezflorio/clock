/**

  @SLIDER: Permite crear elementos tipo slider con dos características:
    * Los valores del slider son siempre enteros pero se pueden mostrar valores
      mapeados a rangos conteniendo valores con parte decimal. Es decir, se
      permite usar un rango interno distinto al rango mostrado.
    * Al aproximarse al extremo superior del slider el rango se amplía de forma
      de ser más preciso al moverse en un subrango muy chico.

  @_Atributos_

  // ID @entero número de identificador del próximo slider a crear.
  // sliders @lista lista con todos los instancias de sliders creados.
  // prototipo @objeto prototipo a usar cuando se crea una nueva instancia.
    Contiene los siguientes métodos:
    // cambiar @void función que se ejecuta cada vez que cambia el valor del slider.
      Si que le pasó una función al slider cuando se creo, se llama a dicha función
      pasándole como argumento el nuevo valor.
    // actualizar @void función que se ejecuta cada vez que se suelta el slider.
      Determina si hay que cambiar el rango de valores del slider.
    // reiniciar @void reinicia el rango del slider y le asigna el rango inicial.

  @_Funciones_

  // nuevo @objeto_slider Toma un objeto con datos de inicialización y devuelve
    una nueva instancia de un slider.
  // cambiar @entero_void Toma un id y llama a la función cambiar del slider con ese id.
  // actualizar @entero_void Toma un id y llama a la función actualizar del slider con ese id.

**/

SLIDER = {
  ID: 0, // para darle un id distinto a cada slider creado
  sliders: [], // lista de sliders creados
  prototipo: {} // prototipo de todos los sliders creados
};

/**@nuevo
  // info @objeto campos permitidos (todos opcionales):
    // placeholderId @string id del elemento en donde insertar el slider.
      Debería estar vacío o su contenido será reemplazado. Si no se le pasa
      este campo se crea un nuevo elemento al final del body.
    // paso @entero multiplicador para convertir entre el rango real y el mostrado.
      Si es 1, ambos rangos coinciden. Si no, el valor real en el slider se divide
      por el paso para obtener el valor real. Entonces, para crear un rango
      que admita valores con hasta dos dígitos decimales, el valor de paso debe ser 100.
      Valor por defecto: 1
    // valorInicial @entero en la escala real, el valor inicial del slider.
      Valor por defecto: el que se le haya asignado al paso.
    // maximoInicial @entero en la escala real, el máximo del rango del slider apenas este
      se crea. Valor por defecto: el doble del que se le haya asignado al paso.
    // maximoMaximo @entero en la escala real, el máximo valor hasta el cual se puede estirar
      rango del slider. Valor por defecto: 10 veces más que el que se le haya asignado al paso.
    // funcion @funcion función a ejecutar cada vez que cambia el valor del slider. Se le pasa
      como argumento el nuevo valor en la escala real. Si no se le pasa ninguna, no hace nada.
    // mostrarLimites @bool muestra los límites actuales en la escala visible a cada lado del
      slider. Valor por defecto: verdadero.
    // mostrarValor @bool muestra el valor actual en la escala visible sobre el slider.
      Valor por defecto: verdadero.
**/
SLIDER.nuevo = function(info) {
  let placeholder;
  if (info.placeholderId === undefined) {
    placeholder = document.createElement('span');
    placeholder.id = `slider_placeholder_${SLIDER.ID}`;
    document.body.appendChild(placeholder);
  } else {
    placeholder = document.getElementById(info.placeholderId);
  }
  let nuevoSlider = Object.create(SLIDER.prototipo);
  nuevoSlider.PASO = info.paso || 1;
  nuevoSlider.VALOR_INICIAL = info.valorInicial || 1*nuevoSlider.PASO;
  nuevoSlider.MAXIMO_INICIAL = info.maximoInicial || 2*nuevoSlider.PASO;
  nuevoSlider.MAXIMO_MAXIMO = info.maximoMaximo-1 || 10*nuevoSlider.PASO-1;
  nuevoSlider.funcion = info.funcion;
  nuevoSlider.mostrarLimites = info.mostrarLimites;
  if (nuevoSlider.mostrarLimites === undefined) { nuevoSlider.mostrarLimites = true; }
  nuevoSlider.mostrarValor = info.mostrarValor;
  if (nuevoSlider.mostrarValor === undefined) { nuevoSlider.mostrarValor = true; }
  let contenido = '';
  if (nuevoSlider.mostrarValor) {
    contenido += '<span id="slider_valor_' + SLIDER.ID + '">' +
      nuevoSlider.VALOR_INICIAL / nuevoSlider.PASO + '</span><br>';
  }
  if (nuevoSlider.mostrarLimites) {
    contenido += '<span id="slider_min_'+SLIDER.ID+'">' + 1/nuevoSlider.PASO + '</span>';
  }
  contenido += '<input type="range" min="1" max="' + nuevoSlider.MAXIMO_INICIAL +
    '" value="' + nuevoSlider.VALOR_INICIAL +'" id="slider_input_' + SLIDER.ID + '" ' +
    'onmouseup="SLIDER.actualizar(' + SLIDER.ID + ');" oninput="SLIDER.cambiar(' + SLIDER.ID + ');">';
  if (nuevoSlider.mostrarLimites) {
    contenido += '<span id="slider_max_' + SLIDER.ID + '">' +
      nuevoSlider.MAXIMO_INICIAL / nuevoSlider.PASO + '</span>';
  }
  placeholder.innerHTML = contenido;
  nuevoSlider.ID = SLIDER.ID;
  SLIDER.sliders.push(nuevoSlider);
  SLIDER.ID ++;
  if (nuevoSlider.funcion !== undefined) {
    nuevoSlider.funcion(nuevoSlider.VALOR_INICIAL);
  }
  return nuevoSlider;
};

/**@cambiar
  // id @entero id del slider que acaba de cambiar.
**/
SLIDER.cambiar = function(id) {
  let slider = SLIDER.sliders[id];
  slider.cambiar();
};

/**@actualizar
  // id @entero id del slider a actualizar.
**/
SLIDER.actualizar = function(id) {
  let slider = SLIDER.sliders[id];
  slider.actualizar();
};

SLIDER.prototipo.cambiar = function() {
  let valor = document.getElementById('slider_input_'+this.ID).value;
  if (this.mostrarValor) {
    document.getElementById('slider_valor_'+this.ID).innerHTML = valor / this.PASO;
  }
  if (this.funcion !== undefined) {
    this.funcion(valor);
  }
};

SLIDER.prototipo.actualizar = function() {
  let slider = document.getElementById('slider_input_'+this.ID);
  let valor = slider.value;
  let maximoActual = slider.max;
  let limiteMax = Math.floor(maximoActual*0.8);
  let limiteMin = Math.ceil(maximoActual*0.45);
  if (maximoActual < this.MAXIMO_MAXIMO && valor > limiteMax) {
    maximoActual = Math.min(this.MAXIMO_MAXIMO, Math.ceil(maximoActual*(1.1)));
  } else if (maximoActual > this.MAXIMO_INICIAL && valor < limiteMin) {
    maximoActual = Math.max(this.MAXIMO_INICIAL, Math.ceil(maximoActual*(valor / limiteMin)));
  } else {
    return;
  }
  maximoActual -= (maximoActual % this.PASO) - this.PASO;
  if (this.mostrarLimites) {
    document.getElementById('slider_max_'+this.ID).innerHTML = Math.floor(maximoActual/this.PASO);
  }
  slider.max = maximoActual;
};

SLIDER.prototipo.reiniciar = function() {
  let slider = document.getElementById('slider_input_'+this.ID);
  slider.max = this.MAXIMO_INICIAL;
  slider.value = this.VALOR_INICIAL;
  if (this.mostrarLimites) {
    document.getElementById('slider_max_'+this.ID).innerHTML = Math.floor(this.MAXIMO_INICIAL / this.PASO);
  }
  this.cambiar();
};
