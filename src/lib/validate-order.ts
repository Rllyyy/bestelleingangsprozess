type OrderInput = {
  customer?: {
    name?: unknown;
    address?: unknown;
    email?: unknown;
  };
  price?: unknown;
  items?: unknown;
  ordered_at?: unknown;
};

type OrderItemInput = {
  article_number?: unknown;
  part_name?: unknown;
  quantity?: unknown;
};

type ValidCustomer = {
  email?: string;
  name?: string;
  address?: string;
};

type ValidItem = {
  article_number?: string;
  part_name?: string;
  quantity?: number;
};

type ValidOrderData = {
  customer: ValidCustomer;
  price?: number;
  ordered_at?: string;
  items: ValidItem[];
};

type ValidationResult = {
  validData: ValidOrderData;
  errors: { path: string; message: string }[];
};

export function validateOrder(input: OrderInput): ValidationResult {
  const validData: ValidOrderData = { customer: {}, items: [] };
  const errors: { path: string; message: string }[] = [];

  // customer.email (required)
  if (typeof input.customer?.email !== "string" || !input.customer.email.includes("@")) {
    errors.push({ path: "customer.email", message: "Email is required and must be valid." });
  } else {
    validData.customer.email = input.customer.email.trim();
  }

  // customer.name
  if (
    input.customer?.name === undefined ||
    input.customer?.name === null ||
    typeof input.customer?.name !== "string" ||
    input.customer.name.trim().length < 1
  ) {
    errors.push({ path: "customer.name", message: "Name must be a non-empty string." });
  } else {
    validData.customer.name = input.customer.name.trim();
  }

  // customer.address
  if (
    typeof input.customer?.address !== "string" ||
    input.customer.address.trim().length < 1 ||
    input.customer?.address === null ||
    input.customer?.address === undefined
  ) {
    errors.push({ path: "customer.address", message: "Address must be a non-empty string." });
  } else {
    validData.customer.address = input.customer.address.trim();
  }

  // price (required, positive)
  if (typeof input.price !== "number" || input.price <= 0) {
    errors.push({ path: "price", message: "Price is required and must be a positive number." });
  } else {
    validData.price = input.price;
  }

  // ordered at
  if (
    typeof input.ordered_at !== "string" ||
    input.ordered_at.trim().length < 1 ||
    input.ordered_at === null ||
    input.ordered_at === undefined
  ) {
    errors.push({ path: "ordered_at", message: "Ordered at is required." });
  } else {
    validData.ordered_at = input.ordered_at;
  }

  if (Array.isArray(input.items) && input.items.length > 0) {
    // items (required, non-empty array)
    (input.items as OrderItemInput[]).forEach((item, i) => {
      const validItem: ValidItem = {};
      let hasInvalid = false;

      if (!item?.article_number || typeof item?.article_number !== "string" || item.article_number.trim().length < 1) {
        errors.push({ path: `items[${i}].article_number`, message: "Article number must be a non-empty string." });
        hasInvalid = true;
      } else {
        validItem.article_number = item.article_number.trim();
      }

      if (!item?.part_name || typeof item?.part_name !== "string" || item.part_name.trim().length < 1) {
        errors.push({ path: `items[${i}].part_name`, message: "Part name must be a non-empty string." });
        hasInvalid = true;
      } else {
        validItem.part_name = item.part_name.trim();
      }

      if (!item?.quantity || typeof item?.quantity !== "number" || item.quantity < 1) {
        errors.push({ path: `items[${i}].quantity`, message: "Quantity must be a positive number." });
        hasInvalid = true;
      } else {
        validItem.quantity = item.quantity;
      }

      if (Object.keys(validItem).length) {
        validData.items.push(validItem);
      }
      if (hasInvalid) {
      }
    });
  } else {
    errors.push({ path: "items", message: "Items is required and must be a non-empty array." });
  }

  return { validData, errors };
}
