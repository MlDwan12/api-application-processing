import { AppDataSource } from '../ormconfig';
import { seedTariffs } from './tariffs.seed';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    await seedTariffs(AppDataSource);
    console.log('🌱 Сиды тарифов успешно выполнены');
  } catch (err) {
    console.error('❌ Ошибка при сидировании:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

void runSeed();
