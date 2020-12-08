import fetch from 'node-fetch';
import { Client } from 'discord.js';
import { messageDiscordUser } from './Discord';

type AvailabilityStatus = {
  availability_status: 'OUT_OF_STOCK' | 'UNAVAILABLE' | 'IN_STOCK';
};

type TargetResponse = {
  products: Product[];
};

type Product = {
  product_id: string;
  locations: Location[];
};

export type Location = {
  location_id: string;
  distance: string;
  store_name: string;
  store_address: string;
  location_available_to_promise_quantity: number;
  order_pickup: AvailabilityStatus;
  curbside: AvailabilityStatus;
  ship_to_store: AvailabilityStatus;
  in_store_only: AvailabilityStatus;
};

type BuyOption =
  | 'order_pickup'
  | 'curbside'
  | 'ship_to_store'
  | 'in_store_only';

const targetDiskProductId = '81114595';
const targetDigitalProductId = '81114596';

export const targetHitMessage = (locations: Location[]): string =>
  `There has been a successful find near you at these locations:
  ${locations.map((location) => location.store_name).join('\n')}
  \nGood Luck!`;

export const onTargetHit = (client: Client, locations: Location[]) => {
  messageDiscordUser(client, targetHitMessage(locations));
};

const requestString = (zipcode: string, productId: string): string =>
  `https://api.target.com/fulfillment_aggregator/v1/fiats/${productId}?key=ff457966e64d5e877fdbad070f276d18ecec4a01&nearby=${zipcode}&limit=20&requested_quantity=1&radius=75`;

const fetchTarget = async (
  productId: string,
  zipcode: string,
): Promise<TargetResponse> => {
  return fetch(requestString(zipcode, productId), {
    method: 'GET',
  }).then((res) => res.json());
};

const findLocationsInStock = (
  locations: Location[],
  buyOption: BuyOption,
): Location[] =>
  locations.filter(
    (location) => location[buyOption].availability_status === 'IN_STOCK',
  );

const locationsWatcher = (response: TargetResponse): Location[] => {
  const locations = response.products[0].locations;
  const orderPickupAvailable = findLocationsInStock(locations, 'order_pickup');
  const curbsideAvailable = findLocationsInStock(locations, 'curbside');
  const shipToStoreAvailable = findLocationsInStock(locations, 'ship_to_store');
  const inStoreAvailable = findLocationsInStock(locations, 'in_store_only');

  const hits: Location[] = [
    ...orderPickupAvailable,
    ...curbsideAvailable,
    ...shipToStoreAvailable,
    ...inStoreAvailable,
  ];

  return hits;
};

export const fetchTargetTimeout = async (
  delay: number,
  productId: string,
  zipcode: string,
  client: Client,
  onSuccess: (client: Client, locations: Location[]) => void,
): Promise<any> => {
  return new Promise(async (resolve) => {
    const targetResponse = await fetchTarget(productId, zipcode);
    const locationsWithStock = locationsWatcher(targetResponse);

    if (locationsWithStock.length > 0) {
      onSuccess(client, locationsWithStock);
    }

    setTimeout(() => resolve(delay), delay);
  }).then((x) =>
    fetchTargetTimeout(x as number, productId, zipcode, client, onSuccess),
  );
};

export const startTarget = async (client: Client, zipcode: string) => {
  console.log('Starting Target Watch');
  await messageDiscordUser(
    client,
    `Starting Target watch for zipcode ${zipcode}.`,
  );
  await fetchTargetTimeout(
    10000,
    targetDigitalProductId,
    zipcode,
    client,
    onTargetHit,
  );
};
