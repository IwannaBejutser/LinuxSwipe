import rawCards from './cards.json';
import { validateCards } from './cardSchema';

export const cards = validateCards(rawCards);
