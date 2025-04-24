class CustomError extends Error {
    constructor(message, code) {
        super(message); // Llama al constructor de la clase Error
        this.code = code; // Añade una propiedad 'code'
        this.name = "CustomError"; // Puedes cambiar el nombre del error
    }
}
