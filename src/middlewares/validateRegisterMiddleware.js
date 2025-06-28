import { body } from "express-validator";

const validationRegister = [
  
  body("email")
    .notEmpty()
    .withMessage("Email requerido")
    .bail()
    .isEmail()
    .withMessage("Debe ser un email válido"),

  body("password")
    .notEmpty()
    .withMessage("Password requerido")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password: mínimo 6 caracteres")
    .bail()
    .matches(/^(?=.*[A-Z]).*$/)
    .withMessage("Password: Debe tener al menos una mayúscula"),
];

export default validationRegister;
