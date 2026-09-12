import { render, screen } from "@testing-library/react";
import AppShell from "../src/components/app-shell";

describe("AppShell", () => {
  it("renderiza la navegación principal y el contenido de la página", () => {
    render(
      <AppShell>
        <main>Contenido de prueba</main>
      </AppShell>
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();

    expect(
      screen.getByRole("navigation", {
        name: "Navegación principal"
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Inspecciones de laboratorio"
      })
    ).toHaveAttribute("href", "/");

    expect(
      screen.getByRole("link", {
        name: "Inicio"
      })
    ).toHaveAttribute("href", "/");

    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });
});