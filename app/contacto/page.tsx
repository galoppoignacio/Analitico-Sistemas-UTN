"use client";
import Navbar from "../Navbar";
import styles from "./Contacto.module.css";
import { useState } from "react";

export default function ContactoPage() {
  const [motivo, setMotivo] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <>
      <Navbar />
      <main className={styles.mainForm}>
        <h1>Contacto</h1>
        {enviado ? (
          <div className={styles.confirmacion}>
            ¡Gracias por tu mensaje! Será revisado a la brevedad.
          </div>
        ) : (
          <form className={styles.form} action="https://formspree.io/f/xdoqzqzq" method="POST" onSubmit={() => setEnviado(true)}>
            <label>
              Motivo de contacto:
              <select name="motivo" value={motivo} onChange={e => setMotivo(e.target.value)} required>
                <option value="" disabled>Seleccioná un motivo</option>
                <option value="Sugerir electiva">Sugerir electiva</option>
                <option value="Sugerir nueva funcionalidad">Sugerir nueva funcionalidad</option>
                <option value="Reportar un error">Reportar un error</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
            <label>
              Mensaje:
              <textarea name="mensaje" required placeholder="Contanos tu sugerencia, consulta o comentario..." />
            </label>
            <label>
              Tu email de contacto:
              <input type="email" name="email" required />
            </label>
            <input type="hidden" name="_replyto" value="utnigna@gmail.com" />
            <button type="submit">Enviar</button>
          </form>
        )}
      </main>
    </>
  );
}
