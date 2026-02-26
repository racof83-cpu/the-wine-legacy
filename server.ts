import express from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors()); // Permite que el juego HTML5 hable con este servidor
app.use(express.json());

// 1. CONEXIÓN A LA BASE DE DATOS (Usando la variable secreta)
const uri = process.env.MONGO_URI || "";
mongoose.connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB Atlas (The Wine Legacy)"))
  .catch(err => console.error("❌ Error conectando a la base de datos:", err));

// 2. EL MODELO TYPESCRIPT (El esquema de datos de Julián)
interface IPlayerSave extends Document {
    playerId: string;
    skinActual: string;
    progresoVinedo: number;
    vidasRestantes: number;
    inventario: string[];
    partidaCompletada: boolean;
}

const PlayerSaveSchema = new Schema<IPlayerSave>({
    playerId: { type: String, required: true, unique: true },
    skinActual: { type: String, default: 'julian_normal' },
    progresoVinedo: { type: Number, default: 0, min: 0, max: 100 },
    vidasRestantes: { type: Number, default: 3, min: 0 },
    inventario: { type: [String], default: ['vial_basico'] },
    partidaCompletada: { type: Boolean, default: false }
}, { timestamps: true });

const PlayerSave = mongoose.model<IPlayerSave>('PlayerSave', PlayerSaveSchema);

// 3. LAS RUTAS (Endpoints)
// Ruta para guardar la partida
app.post('/api/save', async (req: express.Request, res: express.Response) => {
    try {
        const { playerId, skinActual, progresoVinedo, vidasRestantes, inventario, partidaCompletada } = req.body;
        
        const partidaGuardada = await PlayerSave.findOneAndUpdate(
            { playerId }, 
            { skinActual, progresoVinedo, vidasRestantes, inventario, partidaCompletada },
            { new: true, upsert: true } // Actualiza o crea uno nuevo
        );
        
        res.status(200).json({ message: "Guardado exitoso", data: partidaGuardada });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta principal para comprobar que el servidor está vivo
app.get('/', (req: express.Request, res: express.Response) => {
    res.send("🍇 Servidor de The Wine Legacy Activo y Funcionando 🍇");
});

// 4. ENCENDER EL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en el puerto ${PORT}`);
});
