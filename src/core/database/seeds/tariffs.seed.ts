import { TariffEntity } from 'src/applications/entities';
import { DataSource } from 'typeorm';

export const seedTariffs = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(TariffEntity);

  const tariffs = [
    {
      name: 'Стартовый',
      price: 75000,
      description: 'Оперативное управление отделом продаж',
    },
    {
      name: 'Базовый',
      price: 105000,
      description: 'Оперативное управление отделом продаж',
    },
    {
      name: 'Оптимальный',
      price: 155000,
      description:
        'Оперативное управление отделом продаж + построение системы и процессов продаж',
    },
    {
      name: 'Продвижение под ключ',
      price: 205000,
      description: 'Создание ОП под ключ с 0, срок реализации от 3 мес',
    },
  ];

  for (const tariff of tariffs) {
    const exists = await repo.findOne({ where: { name: tariff.name } });
    if (!exists) {
      await repo.save(repo.create(tariff));
    }
  }

  console.log('✅ Tariffs seeded successfully');
};
