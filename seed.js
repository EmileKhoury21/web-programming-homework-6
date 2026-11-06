
import 'dotenv/config';
import mongoose from 'mongoose';
import { Wine } from './models/Wine.js';

const wines = [
  {
    name: 'Merlot',
    slug: 'merlot',
    color: 'rouge',
    varietals: ['Cabernet Sauvignon', 'Syrah', 'Grenache', 'Cinsault'],
    format: '750 mL · 13.5° GL',
    serveTemp: 'Best served at 16°C',
    description: 'A full-bodied red with fine blackberry and smoky aromas. Very elegant, a red wine of intense robe, strong and refined.',
    imageUrl: '/wines/merlot-bottle.jpg',
  },
  {
    name: 'Cuvée du Temple',
    slug: 'cuvee-du-temple',
    color: 'rouge',
    varietals: ['Cabernet Sauvignon', 'Syrah', 'Grenache', 'Cinsault'],
    format: '750 mL · 12.5° GL',
    serveTemp: 'Best tasted between 15 and 16°C',
    description: 'An intense red wine, round on the palate, with ripe red-fruit aromas of cherries, prunes and cherry plums. Rich in tannin, warm and pleasant.',
    imageUrl: '/wines/cuvee-du-temple-bottle.jpg',
  },
  {
    name: 'Château Fakra Private Collection',
    slug: 'private-collection',
    color: 'rouge',
    varietals: ['Cabernet Sauvignon', 'Syrah'],
    format: '750 mL · 13° GL',
    serveTemp: 'Best tasted between 16 and 18°C',
    description: 'An intense red wine with a rich, complex bouquet of red-fruit aromas and hints of vanilla and spice. Aged in new oak barrels for twelve months.',
    imageUrl: '/wines/private-collection-bottle.jpg',
  },
  {
    name: 'Perla Bianca',
    slug: 'perla-bianca',
    color: 'blanc',
    varietals: ['Chardonnay', 'Viognier', 'Sauvignon Blanc'],
    format: '750 mL · 12.5° GL',
    serveTemp: 'Best tasted at 12°C',
    description: 'A typical and elegant white wine with golden reflections. An aromatic nose of passion fruit, peach, apricot and grapefruit.',
    imageUrl: '/wines/perla-bianca-bottle.jpg',
  },
  {
    name: 'Blanc de Blancs',
    slug: 'blanc-de-blancs',
    color: 'blanc',
    varietals: ['Viognier', 'Muscat'],
    format: '750 mL · 375 mL · 13.5° GL',
    serveTemp: 'Best tasted at 12°C',
    description: 'A rare Blanc de Blancs, astounding with its sublime finesse of honey aromas, acacia and cedar.',
    imageUrl: '/wines/blanc-de-blancs-bottle.jpg',
  },
  {
    name: 'La Fleur',
    slug: 'la-fleur',
    color: 'rosé',
    varietals: ['Grenache', 'Cinsault', 'Carignan', 'Syrah'],
    format: '375 mL · 12.5° GL',
    serveTemp: 'Served between 8 and 10°C',
    description: 'A saignée rosé with an intense salmon-pink colour and notes of exotic fruit. Perfect as an apéritif or with Lebanese mezze.',
    imageUrl: '/wines/la-fleur-bottle.jpg',
  },
  {
    name: 'Vin Doux Naturel',
    slug: 'vin-doux-naturel',
    color: 'doux',
    varietals: ['Ancestral method'],
    format: '750 mL · 375 mL',
    serveTemp: 'Best served between 10 and 12°C',
    description: 'A sweet wine made with ancestral methods. Appreciated as an apéritif and with desserts.',
    imageUrl: '/wines/vin-doux-naturel-bottle.jpg',
  },
];

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Wine.deleteMany({});
  await Wine.insertMany(wines);
  console.log(`added ${wines.length} wines`);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
