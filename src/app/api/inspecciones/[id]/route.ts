import { NextResponse } from "next/server";
import { getInspectionById } from "../../../../lib/data/inspections";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const url = new URL(request.url);
  const forzarError = url.searchParams.get("estado") === "error";

  try {
    if (forzarError) {
      throw new Error("Error simulado para pruebas");
    }
    const inspection = await getInspectionById(params.id);
    if (!inspection) {
      return NextResponse.json(
        { message: "Inspección no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json(
      { message: "No se pudo obtener la inspección" },
      { status: 500 }
    );
  }
}