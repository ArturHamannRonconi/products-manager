import { HttpStatus } from 'ddd-tool-kit';

const INVALID_INVENTORY_AMOUNT = {
  message: 'Inventory amount must be a non-negative integer.',
  statusCode: HttpStatus.BAD_REQUEST,
};

export { INVALID_INVENTORY_AMOUNT };
