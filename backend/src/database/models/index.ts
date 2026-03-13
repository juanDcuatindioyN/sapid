import Usuario from './Usuario';
import Pesaje from './Pesaje';
import PesajeDetalle from './PesajeDetalle';
import Log from './Log';

// Export all models
export { Usuario, Pesaje, PesajeDetalle, Log };

// Export a function to sync all models
export const syncModels = async (force = false) => {
  await Usuario.sync({ force });
  await Pesaje.sync({ force });
  await PesajeDetalle.sync({ force });
  await Log.sync({ force });
};
