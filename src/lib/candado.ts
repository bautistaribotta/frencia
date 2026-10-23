/* Frencia · Candado contra doble toque.
   Bloquea una accion mientras la anterior sigue en vuelo. Vive fuera del
   estado de React: dos toques dentro del mismo render verian el mismo valor
   viejo de un useState y correrian la accion dos veces. Se usa en lugar de un
   useRef cuando los handlers se arman durante el render (por ejemplo, en una
   funcion que devuelve la fila), donde el compilador no deja leer refs. */

export interface Candado {
  /** Devuelve false si ya estaba tomado; si no, lo toma y devuelve true. */
  tomar(): boolean;
  soltar(): void;
  tomado(): boolean;
}

export function crearCandado(): Candado {
  let tomado = false;
  return {
    tomar() {
      if (tomado) return false;
      tomado = true;
      return true;
    },
    soltar() {
      tomado = false;
    },
    tomado() {
      return tomado;
    },
  };
}
