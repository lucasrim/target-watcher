import fetch from 'node-fetch';
import yargs from 'yargs';
import Discord from 'discord.js';

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

type Location = {
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

type ConsoleType = 'disk' | 'digital';

const args = yargs.options({
  zipcode: { type: 'string', demandOption: true, alias: 'z' },
}).argv;

const requestString = (
  zipcode: string,
  consoleType: 'disk' | 'digital',
): string =>
  `https://api.target.com/fulfillment_aggregator/v1/fiats/${
    consoleType === 'disk' ? '81114595' : '81114596'
  }?key=ff457966e64d5e877fdbad070f276d18ecec4a01&nearby=${zipcode}&limit=20&requested_quantity=1&radius=75`;

const fetchTarget = (callback: any, consoleType: ConsoleType) =>
  fetch(requestString(args['zipcode'], consoleType), {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((json) => {
      console.log(
        `Checking stores near ${args['zipcode']} for ${consoleType}:`,
      );
      callback(json);
    });

const findLocationsInStock = (
  locations: Location[],
  buyOption: BuyOption,
): Location[] =>
  locations.filter(
    (location) => location[buyOption].availability_status === 'IN_STOCK',
  );

const locationsWatcher = (response: TargetResponse) => {
  const locations = response.products[0].locations;
  const orderPickupAvailable = findLocationsInStock(locations, 'order_pickup');
  const curbsideAvailable = findLocationsInStock(locations, 'curbside');
  const shipToStoreAvailable = findLocationsInStock(locations, 'ship_to_store');
  const inStoreAvailable = findLocationsInStock(locations, 'in_store_only');

  console.log(`Order Pickup Available: ${orderPickupAvailable}`);
  console.log(`Curbside Available: ${curbsideAvailable}`);
  console.log(`Ship to Store Available: ${shipToStoreAvailable}`);
  console.log(`In Store Available: ${inStoreAvailable}`);
};

async function asyncTimeout(
  delay: number,
  consoleType: ConsoleType,
): Promise<any> {
  return new Promise(async (resolve) => {
    await fetchTarget(locationsWatcher, consoleType);
    console.log();
    setTimeout(() => resolve(delay), delay);
  }).then((x) => asyncTimeout(x as number, consoleType));
}

asyncTimeout(10000, 'disk');
asyncTimeout(10000, 'digital');
