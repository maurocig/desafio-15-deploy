const MongoContainer = require('../containers/Mongodb.container');
const { HttpError } = require('../../utils/api.utils');
const ProductSchema = require('../schemas/Product.schema');
const constants = require('../../constants/api.constants');

const collection = 'Products';

class ProductsDao extends MongoContainer {
  constructor() {
    super(collection, ProductSchema);
  }

  async createProduct(productItem) {
    try {
      const product = await this.save(productItem);
      return product;
    } catch (error) {
      throw new HttpError(constants.HTTP_STATUS.INTERNAL_ERROR, error.message, error);
    }
  }

  async getById(id) {
    try {
      const document = await this.model.findById(id, { __v: 0 }).lean();
      if (!document) {
        const errorMessage = `Resource with id ${id} does not exist in our records`;
        throw new HttpError(constants.HTTP_STATUS.NOT_FOUND, errorMessage);
      } else {
        return document;
      }
    } catch (error) {
      throw new HttpError(constants.HTTP_STATUS.INTERNAL_ERROR, error.message, error);
    }
  }
}

const productsDao = new ProductsDao();
module.exports = productsDao;
