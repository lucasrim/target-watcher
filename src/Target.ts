import fetch from 'node-fetch';

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

type ConsoleType = 'disk' | 'digital';

const requestString = (
  zipcode: string,
  consoleType: 'disk' | 'digital',
): string =>
  `https://api.target.com/fulfillment_aggregator/v1/fiats/${
    consoleType === 'disk' ? '81114595' : '81114596'
  }?key=ff457966e64d5e877fdbad070f276d18ecec4a01&nearby=${zipcode}&limit=20&requested_quantity=1&radius=75`;

const fetchTarget = (
  locationsWatcher: (
    response: TargetResponse,
    onSuccess: (locations: Location[]) => void,
  ) => void,
  consoleType: ConsoleType,
  zipcode: string,
  onSuccess: (locations: Location[]) => void,
) =>
  fetch(requestString(zipcode, consoleType), {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((json) => {
      locationsWatcher(json, onSuccess);
    })
    .catch((err) => console.log(err));

const findLocationsInStock = (
  locations: Location[],
  buyOption: BuyOption,
): Location[] =>
  locations.filter(
    (location) => location[buyOption].availability_status === 'IN_STOCK',
  );

const locationsWatcher = (
  response: TargetResponse,
  onSuccess: (locations: Location[]) => void,
): void => {
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

  if (hits.length > 0) {
    onSuccess(hits);
  }
};

async function fetchTargetTimeout(
  delay: number,
  consoleType: ConsoleType,
  zipcode: string,
  onSuccess: (locations: Location[]) => void,
): Promise<any> {
  return new Promise(async (resolve) => {
    await fetchTarget(locationsWatcher, consoleType, zipcode, onSuccess);
    setTimeout(() => resolve(delay), delay);
  })
    .then((x) =>
      fetchTargetTimeout(x as number, consoleType, zipcode, onSuccess),
    )
    .catch((err) => console.log(err));
}

export { fetchTargetTimeout };
