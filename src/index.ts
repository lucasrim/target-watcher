import fetch from 'node-fetch';
import yargs from 'yargs';

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

const args = yargs.options({
  zipcode: { type: 'string', demandOption: true, alias: 'z' },
}).argv;

const requestString = (zipcode: string): string =>
  `https://api.target.com/fulfillment_aggregator/v1/fiats/81114595?key=ff457966e64d5e877fdbad070f276d18ecec4a01&nearby=${zipcode}&limit=20&requested_quantity=1&radius=75&fulfillment_test_mode=grocery_opu_team_member_test`;

const fetchTarget = (callback: any) =>
  fetch(requestString(args['zipcode']), {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((json) => callback(json));

const locationsWatcher = (response: TargetResponse) => {
  const locations = response.products[0].locations;
  const orderPickupAvailable = locations.filter(
    (location) => location.order_pickup.availability_status === 'IN_STOCK',
  );
  const curbsideAvailable = locations.filter(
    (location) => location.curbside.availability_status === 'IN_STOCK',
  );
  const shipToStoreAvailable = locations.filter(
    (location) => location.ship_to_store.availability_status === 'IN_STOCK',
  );
  const inStoreAvailable = locations.filter(
    (location) => location.in_store_only.availability_status === 'IN_STOCK',
  );

  console.log(`Order Pickup Available: ${orderPickupAvailable}`);
  console.log(`Curbside Available: ${curbsideAvailable}`);
  console.log(`Ship to Store Available: ${shipToStoreAvailable}`);
  console.log(`In Store Available: ${inStoreAvailable}`);
};

async function asyncTimeout(delay: number): Promise<any> {
  return new Promise(async (resolve) => {
    console.log(`Checking stores near ${args['zipcode']}:`);
    console.log();
    await fetchTarget(locationsWatcher);
    console.log();
    setTimeout(() => resolve(delay), delay);
  }).then((x) => asyncTimeout(x as number));
}

asyncTimeout(10000);
